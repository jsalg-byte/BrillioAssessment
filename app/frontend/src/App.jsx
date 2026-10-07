import { useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:8000'

function App() {
  // 1. Form input state: tracks typing without triggering API requests on every keystroke
  const [formData, setFormData] = useState({
    minPrice: '',
    maxPrice: '',
    minBedrooms: '',
    city: '',
    keyword: '',
    targetBudget: '',
    pageSize: '5',
  })

  // Active query state: holds the filters actively submitted, keeping pagination stable
  const [activeFilters, setActiveFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minBedrooms: '',
    city: '',
    keyword: '',
    targetBudget: '',
    pageSize: '5',
  })

  // 2. API state: tracks response data, loading, error, and pagination separately
  const [apiState, setApiState] = useState({
    listings: [],
    totalCount: 0,
    totalPages: 1,
    page: 1,
    pageSize: 5,
    loading: false,
    error: null,
  })

  // Dynamic Query Building with URLSearchParams
  const fetchListings = async (filtersToUse, targetPage = 1) => {
    setApiState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const params = new URLSearchParams()

      // Dynamically attach only non-empty form fields
      Object.entries(filtersToUse).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params.set(key, value)
        }
      })

      // Explicitly set target page
      params.set('page', targetPage)

      const response = await fetch(`${API_BASE_URL}/api/search?${params.toString()}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.detail || `Request failed with status ${response.status}`
        window.alert(`Search Error: ${errorMessage}`)
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setApiState({
        listings: data.results || [],
        totalCount: data.totalCount || 0,
        totalPages: data.totalPages || 1,
        page: data.page || 1,
        pageSize: data.pageSize || 5,
        loading: false,
        error: null,
      })
    } catch (err) {
      setApiState((prev) => ({
        ...prev,
        listings: [],
        loading: false,
        error: err.message || 'An unexpected error occurred',
      }))
    }
  }

  // Initial Mount: load initial listings immediately
  useEffect(() => {
    fetchListings(formData, 1)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Intercept the search: prevent page refresh and always reset back to page 1
  const handleSubmit = (e) => {
    e.preventDefault()
    setActiveFilters(formData)
    fetchListings(formData, 1)
  }

  const handlePageChange = (newPage) => {
    fetchListings(activeFilters, newPage)
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
                disabled={apiState.loading}
                aria-label="Submit property search"
                style={{
                  padding: '0.6rem 1.5rem',
                  minHeight: '44px',
                  backgroundColor: apiState.loading ? '#94a3b8' : '#2563eb',
                  color: '#ffffff',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: apiState.loading ? 'not-allowed' : 'pointer',
                }}
              >
                {apiState.loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </search>

        {/* Live status announcement */}
        <div aria-live="polite" aria-atomic="true" style={{ minHeight: '1.5rem', marginBottom: '1rem', color: '#64748b' }}>
          {apiState.loading && 'Loading listings...'}
        </div>

        {/* Results Container: Conditional Rendering Matrix */}
        <section aria-label="Search Results" style={{ marginBottom: '3rem' }}>
          {/* State 1: Error message */}
          {apiState.error && (
            <div
              role="alert"
              style={{
                padding: '1rem 1.25rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #f87171',
                borderRadius: '6px',
                color: '#b91c1c',
                fontWeight: 500,
                marginBottom: '1.5rem',
              }}
            >
              <strong>Error: </strong>
              {apiState.error}
            </div>
          )}

          {/* State 2: Loading indicator */}
          {apiState.loading && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '1.1rem' }}>
              Loading listings...
            </div>
          )}

          {/* State 3: No matches found */}
          {!apiState.loading && !apiState.error && apiState.listings.length === 0 && (
            <div
              style={{
                padding: '2.5rem',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                border: '1px dashed #cbd5e1',
                borderRadius: '8px',
                color: '#475569',
              }}
            >
              <h3 style={{ margin: '0 0 0.5rem 0' }}>No listings matched your criteria</h3>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>Try broadening your price bounds, removing keywords, or clearing the city filter.</p>
            </div>
          )}

          {/* State 4: Render listing cards / boxes */}
          {!apiState.loading && !apiState.error && apiState.listings.length > 0 && (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  color: '#475569',
                  fontSize: '0.95rem',
                }}
              >
                <span>
                  Showing <strong>{apiState.listings.length}</strong> of <strong>{apiState.totalCount}</strong> listings (Page {apiState.page} of {apiState.totalPages})
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {apiState.listings.map((listing) => (
                  <article
                    key={`${listing.source}-${listing.id}`}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '1.25rem 1.5rem',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#1e293b' }}>
                        {listing.address}
                      </h2>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.6rem',
                            borderRadius: '9999px',
                            backgroundColor: '#e0e7ff',
                            color: '#3730a3',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                          }}
                        >
                          Relevance: {listing.relevance ?? 'N/A'}
                        </span>
                        <span
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            fontSize: '0.8rem',
                            textTransform: 'uppercase',
                          }}
                        >
                          {listing.status}
                        </span>
                      </div>
                    </div>

                    <p style={{ margin: '0 0 0.75rem 0', color: '#64748b', fontSize: '0.95rem' }}>
                      {listing.city}, {listing.state} {listing.zip} &bull; <em style={{ fontStyle: 'normal' }}>Source: {listing.source}</em>
                    </p>

                    <ul
                      style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: '0 0 0.75rem 0',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '1.5rem',
                        fontSize: '0.95rem',
                        color: '#334155',
                      }}
                    >
                      <li>
                        <strong>Price:</strong> ${listing.price ? Number(listing.price).toLocaleString() : 'N/A'}
                      </li>
                      <li>
                        <strong>Bedrooms:</strong> {listing.bedrooms}
                      </li>
                      <li>
                        <strong>Bathrooms:</strong> {listing.bathrooms}
                      </li>
                      <li>
                        <strong>Sqft:</strong> {listing.sqft ? Number(listing.sqft).toLocaleString() : 'N/A'}
                      </li>
                      <li>
                        <strong>Listed:</strong> {listing.listedDate}
                      </li>
                    </ul>

                    {listing.description && (
                      <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: '1.4' }}>
                        {listing.description}
                      </p>
                    )}
                  </article>
                ))}
              </div>

              {/* Hard-stopping Pagination Bar */}
              <nav
                aria-label="Search results pagination"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '1rem',
                  marginTop: '2rem',
                }}
              >
                <button
                  type="button"
                  disabled={apiState.page <= 1 || apiState.loading}
                  onClick={() => handlePageChange(apiState.page - 1)}
                  style={{
                    padding: '0.5rem 1rem',
                    minHeight: '44px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: apiState.page <= 1 ? '#f1f5f9' : '#ffffff',
                    cursor: apiState.page <= 1 ? 'not-allowed' : 'pointer',
                    color: apiState.page <= 1 ? '#94a3b8' : '#1e293b',
                    fontWeight: 500,
                  }}
                >
                  &larr; Previous
                </button>

                <span style={{ fontSize: '0.95rem', color: '#475569' }}>
                  Page {apiState.page} of {apiState.totalPages}
                </span>

                <button
                  type="button"
                  disabled={apiState.page >= apiState.totalPages || apiState.loading}
                  onClick={() => handlePageChange(apiState.page + 1)}
                  style={{
                    padding: '0.5rem 1rem',
                    minHeight: '44px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: apiState.page >= apiState.totalPages ? '#f1f5f9' : '#ffffff',
                    cursor: apiState.page >= apiState.totalPages ? 'not-allowed' : 'pointer',
                    color: apiState.page >= apiState.totalPages ? '#94a3b8' : '#1e293b',
                    fontWeight: 500,
                  }}
                >
                  Next &rarr;
                </button>
              </nav>
            </>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
