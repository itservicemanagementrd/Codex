'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { PricingMode, Project, ScenarioResult } from '@/types';

const modes: PricingMode[] = ['PLAN SIMPLE', 'PLAN PERSONALIZADO', 'CUOTAS EXTRAORDINARIAS', 'CALCULADORA'];

export function Dashboard({ token, user }: { token: string; user: { name: string; role: string } }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [mode, setMode] = useState<PricingMode>('PLAN SIMPLE');
  const [downPayment, setDownPayment] = useState(30000);
  const [installments, setInstallments] = useState(120);
  const [frequency, setFrequency] = useState('monthly');
  const [extraPeriod, setExtraPeriod] = useState(6);
  const [extraAmount, setExtraAmount] = useState(0);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [analytics, setAnalytics] = useState<Record<string, number>>({});

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId),
    [projects, selectedProjectId]
  );

  useEffect(() => {
    const loadData = async () => {
      const projectResponse = await apiRequest<Project[]>('/projects', {}, token);
      setProjects(projectResponse);
      if (projectResponse[0]) {
        setSelectedProjectId(projectResponse[0].id);
      }
      const analyticsResponse = await apiRequest<{ modeUsage: Record<string, number> }>('/analytics/modes', {}, token);
      setAnalytics(analyticsResponse.modeUsage);
      const scenarios = await apiRequest<Array<unknown>>('/scenarios', {}, token);
      setSavedCount(scenarios.length);
    };

    loadData().catch(console.error);
  }, [token]);

  const generateScenario = async () => {
    if (!selectedProjectId) return;
    const extraPayments = mode === 'CUOTAS EXTRAORDINARIAS' && extraAmount > 0 ? [{ period: extraPeriod, amount: extraAmount }] : [];
    const response = await apiRequest<ScenarioResult>(
      '/scenarios/generate',
      {
        method: 'POST',
        body: JSON.stringify({ projectId: selectedProjectId, mode, downPayment, frequency, installments, extraPayments })
      },
      token
    );
    setResult(response);
    const analyticsResponse = await apiRequest<{ modeUsage: Record<string, number> }>('/analytics/modes', {}, token);
    setAnalytics(analyticsResponse.modeUsage);
  };

  const saveScenario = async () => {
    if (!result || !selectedProjectId) return;
    await apiRequest(
      '/scenarios/save',
      {
        method: 'POST',
        body: JSON.stringify({
          name: `${selectedProject?.name} - ${mode}`,
          projectId: selectedProjectId,
          inputs: { mode, downPayment, frequency, installments, extraAmount, extraPeriod },
          result
        })
      },
      token
    );
    const scenarios = await apiRequest<Array<unknown>>('/scenarios', {}, token);
    setSavedCount(scenarios.length);
  };

  return (
    <div className="container">
      <div className="card" style={{ marginBottom: 12 }}>
        <h2>Welcome, {user.name}</h2>
        <p>Role: {user.role} · Saved scenarios: {savedCount}</p>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3>Project & Pricing Inputs</h3>
          <div className="grid">
            <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name} - {project.location}</option>
              ))}
            </select>

            <select value={mode} onChange={(e) => setMode(e.target.value as PricingMode)}>
              {modes.map((option) => <option key={option}>{option}</option>)}
            </select>

            <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              {(selectedProject?.frequencies || ['monthly']).map((item) => <option key={item}>{item}</option>)}
            </select>

            <input type="number" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} placeholder="Down payment" />
            <input type="number" value={installments} onChange={(e) => setInstallments(Number(e.target.value))} placeholder="Installments" />

            {mode === 'CUOTAS EXTRAORDINARIAS' ? (
              <>
                <input type="number" value={extraPeriod} onChange={(e) => setExtraPeriod(Number(e.target.value))} placeholder="Extra payment period" />
                <input type="number" value={extraAmount} onChange={(e) => setExtraAmount(Number(e.target.value))} placeholder="Extra payment amount" />
              </>
            ) : null}

            <button onClick={generateScenario}>Generate Scenario</button>
            <button className="secondary" onClick={saveScenario} disabled={!result}>Save Scenario</button>
          </div>
        </div>

        <div className="card">
          <h3>Scenario Analytics</h3>
          {Object.keys(analytics).length === 0 ? <p>No usage data yet.</p> : (
            <ul>
              {Object.entries(analytics).map(([key, value]) => (
                <li key={key}>{key}: {value} views</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {result ? (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>Scenario Result: {result.mode}</h3>
          <div className="grid grid-2">
            <p>Base Price: ${result.summary.basePrice.toLocaleString()}</p>
            <p>Down Payment: ${result.summary.downPayment.toLocaleString()}</p>
            <p>Installments: {result.summary.installments}</p>
            <p>Installment Amount: ${result.summary.baseInstallmentAmount.toLocaleString()}</p>
            <p>Total Interest: ${result.summary.totalInterest.toLocaleString()}</p>
            <p>Total Cost: ${result.summary.totalCost.toLocaleString()}</p>
          </div>

          {result.schedule.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Period</th><th>Principal</th><th>Interest</th><th>Extra</th><th>Payment</th><th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.slice(0, 24).map((row) => (
                  <tr key={row.period}>
                    <td>{row.period}</td>
                    <td>${row.principal.toFixed(2)}</td>
                    <td>${row.interest.toFixed(2)}</td>
                    <td>${row.extra.toFixed(2)}</td>
                    <td>${row.payment.toFixed(2)}</td>
                    <td>${row.remainingBalance.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>PLAN SIMPLE mode selected. Payment schedule hidden by design.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
