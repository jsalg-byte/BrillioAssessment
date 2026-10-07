import { useState } from 'react'

function App() {
  // Form input state: tracks typing without triggering API calls on each keystroke
  const [formData, setFormData] = useState({
    minPrice: '',
    maxPrice: '',
    minBedrooms: '',
    city: '',
    keyword: '',
    targetBudget: '',
    pageSize: '5',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Search triggered with:', formData)
  }

  return (
    <div style={{ maxWidth: '960px', margin: '2rem auto', padding: '0 1.25rem', fontFamily: 'system-ui, sans-serif' }}>
      <header>
        <h1 style={{ marginBottom: '1.5rem', color: '#1a202c' }}>Listing Search Service</h1>
      </header>

      <main>
        <search role="search">
          <form
            onSubmit={handleSubmit}
            aria-label="Property Search Filters"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.25rem',
              alignItems: 'flex-end',
              padding: '1.5rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              marginBottom: '2rem',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="minPrice" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#2d3748' }}>
                Min Price ($)
              </label>
              <input
                id="minPrice"
                name="minPrice"
                type="number"
                min="0"
                step="5000"
                placeholder="e.g. 300000"
                aria-describedby="minPrice-hint"
                value={formData.minPrice}
                onChange={handleChange}
                style={{ padding: '0.6rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', minHeight: '44px' }}
              />
              <span id="minPrice-hint" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Min listing price in USD
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="maxPrice" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#2d3748' }}>
                Max Price ($)
              </label>
              <input
                id="maxPrice"
                name="maxPrice"
                type="number"
                min="0"
                step="5000"
                placeholder="e.g. 600000"
                aria-describedby="maxPrice-hint"
                value={formData.maxPrice}
                onChange={handleChange}
                style={{ padding: '0.6rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', minHeight: '44px' }}
              />
              <span id="maxPrice-hint" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Max listing price in USD
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="targetBudget" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#2d3748' }}>
                Target Budget ($)
              </label>
              <input
                id="targetBudget"
                name="targetBudget"
                type="number"
                min="0"
                step="5000"
                placeholder="e.g. 500000"
                aria-describedby="budget-hint"
                value={formData.targetBudget}
                onChange={handleChange}
                style={{ padding: '0.6rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', minHeight: '44px' }}
              />
              <span id="budget-hint" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Optional target for scoring
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="minBedrooms" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#2d3748' }}>
                Min Bedrooms
              </label>
              <input
                id="minBedrooms"
                name="minBedrooms"
                type="number"
                min="0"
                placeholder="e.g. 2"
                value={formData.minBedrooms}
                onChange={handleChange}
                style={{ padding: '0.6rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', minHeight: '44px', width: '120px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="city" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#2d3748' }}>
                City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                placeholder="e.g. Springfield"
                value={formData.city}
                onChange={handleChange}
                style={{ padding: '0.6rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', minHeight: '44px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="keyword" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#2d3748' }}>
                Keyword
              </label>
              <input
                id="keyword"
                name="keyword"
                type="text"
                placeholder="e.g. pet, pool"
                value={formData.keyword}
                onChange={handleChange}
                style={{ padding: '0.6rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', minHeight: '44px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="pageSize" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#2d3748' }}>
                Per Page
              </label>
              <input
                id="pageSize"
                name="pageSize"
                type="number"
                min="1"
                max="50"
                value={formData.pageSize}
                onChange={handleChange}
                style={{ padding: '0.6rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', minHeight: '44px', width: '90px' }}
              />
            </div>

            <div>
              <button
                type="submit"
                aria-label="Submit property search"
                style={{
                  padding: '0.6rem 1.5rem',
                  minHeight: '44px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Search
              </button>
            </div>
          </form>
        </search>

        {/* Live region reserved for screen readers */}
        <div aria-live="polite" aria-atomic="true" style={{ minHeight: '1.5rem', marginBottom: '1rem' }}></div>
      </main>
    </div>
  )
}

export default App
