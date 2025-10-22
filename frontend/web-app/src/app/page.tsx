export default function RootPage() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>DocGO - Root Page</h1>
      <p>Server is working!</p>
      <div style={{ marginTop: '20px' }}>
        <a href="/home" style={{ color: 'blue', textDecoration: 'underline', marginRight: '20px' }}>Go to /home</a>
        <a href="/test" style={{ color: 'blue', textDecoration: 'underline' }}>Go to /test</a>
      </div>
    </div>
  )
}