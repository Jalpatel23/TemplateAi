import React, { useState } from 'react';

const basePlans = [
  {
    title: 'Individuals',
    price: 0,
    priceLabel: 'Free',
    description: 'For personal productivity and learning',
    features: [
      'AI-powered chat assistant',
      '5 chat histories saved',
      'File uploads (images, PDFs)',
      'Basic code highlighting',
      'Dark & light theme support',
      'Community support',
    ],
    button: 'Get started',
    isFree: true,
  },
  {
    title: 'Teams',
    price: 90,
    priceLabel: 'US$90',
    sub: 'Per month/year',
    description: 'For small teams and collaboration',
    features: [
      'Everything in Individuals',
      '50 chat histories saved',
      'Team chat collaboration',
      'Priority email support',
      'Increased file upload size',
      'Guest access for team members',
    ],
    button: 'Get started',
  },
  {
    title: 'Organizations',
    price: 120,
    priceLabel: 'US$120',
    sub: 'Per month/year',
    description: 'For growing organizations',
    features: [
      'Everything in Teams',
      'Unlimited chat histories',
      'Advanced analytics & usage stats',
      'Custom chat categories',
      'Role-based access control',
      'Dedicated onboarding support',
    ],
    button: 'Get started',
  },
  {
    title: 'Enterprise',
    price: null,
    priceLabel: 'Custom',
    description: 'For large-scale and custom needs',
    features: [
      'Everything in Organizations',
      'Custom integrations (API access, webhooks)',
      'Dedicated account manager',
      '24/7 premium support',
      'SLA & compliance features',
      'Early access to new features',
    ],
    button: 'Contact Us',
    isCustom: true,
  },
];

function getPriceLabel(plan, yearly) {
  if (plan.isFree) return 'Free';
  if (plan.isCustom) return 'Custom';
  if (yearly) {
    const yearlyPrice = Math.round(plan.price * 0.7);
    return `US$${yearlyPrice}`;
  }
  return `US$${plan.price}`;
}

const Subscription = () => {
  const [yearly, setYearly] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: '#111', color: '#fff', fontFamily: 'Inter, sans-serif', padding: '0', margin: '0' }}>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '60px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Simple Pricing</h1>
        <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '1rem' }}>Choose the best plan for your needs</p>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem' }}>
          <button
            style={{
              background: !yearly ? '#fff' : '#222',
              color: !yearly ? '#18181b' : '#fff',
              border: 'none',
              borderRadius: '20px 0 0 20px',
              padding: '0.5rem 1.5rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onClick={() => setYearly(false)}
          >
            Monthly
          </button>
          <button
            style={{
              background: yearly ? '#fff' : '#222',
              color: yearly ? '#18181b' : '#fff',
              border: 'none',
              borderRadius: '0 20px 20px 0',
              padding: '0.5rem 1.5rem',
              fontWeight: 500,
              cursor: 'pointer',
              opacity: yearly ? 1 : 0.7,
              transition: 'background 0.2s',
            }}
            onClick={() => setYearly(true)}
          >
            Yearly <span style={{ background: yearly ? '#fff' : '#222', color: yearly ? '#18181b' : '#fff', borderRadius: '10px', fontSize: '0.8em', marginLeft: '0.5em', padding: '0.1em 0.5em', opacity: 0.7 }}>Save 30%</span>
          </button>
        </div>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {basePlans.map((plan, idx) => (
            <div key={plan.title} style={{
              background: '#18181b',
              borderRadius: '14px',
              boxShadow: '0 2px 16px 0 rgba(0,0,0,0.15)',
              minWidth: '260px',
              maxWidth: '300px',
              padding: '2rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              border: plan.title === 'Enterprise' ? '2px solid #fff2' : '1px solid #232323',
              marginTop: plan.title === 'Enterprise' ? '1.5rem' : 0,
              minHeight: '420px',
              position: 'relative',
            }}>
              <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem', color: '#fff' }}>{plan.title}</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.2rem', color: '#fff' }}>{getPriceLabel(plan, yearly)}</div>
              {plan.sub && <div style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '0.5rem' }}>{plan.sub}</div>}
              <div style={{ fontSize: '0.95rem', color: '#aaa', marginBottom: '1.2rem' }}>{plan.description}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '1.5rem', width: '100%' }}>
                {plan.features.map((feature, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.6rem', color: '#fff', fontSize: '0.97rem' }}>
                    <span style={{ display: 'inline-block', width: '1.1em', height: '1.1em', marginRight: '0.7em', color: '#4ade80' }}>✔</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button style={{
                width: '100%',
                background: plan.title === 'Enterprise' ? '#232323' : '#fff',
                color: plan.title === 'Enterprise' ? '#fff' : '#18181b',
                border: 'none',
                borderRadius: '8px',
                padding: '0.8em 0',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                marginTop: 'auto',
                transition: 'background 0.2s',
              }}>{plan.button} <span style={{ marginLeft: '0.5em', fontSize: '1.1em' }}>→</span></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subscription; 