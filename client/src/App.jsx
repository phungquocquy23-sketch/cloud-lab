import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // Câu 47: State quản lý danh sách sinh viên
  const [students, setStudents] = useState([])

  // Câu 48: State quản lý dữ liệu form
  const [formData, setFormData] = useState({
    mssv: '',
    name: '',
    email: ''
  })

  // Câu 47: Gọi GET /api/students từ Backend API
  useEffect(() => {
    fetch('/api/students')
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error("Lỗi khi tải danh sách sinh viên:", err))
  }, [])

  // Câu 48: Cập nhật giá trị ô input
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // Câu 49: Xử lý Submit Form để POST dữ liệu lên server
  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      studentId: formData.mssv,
      name: formData.name,
      email: formData.email
    }

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        alert('Thêm sinh viên thành công!')
        const newStudent = await response.json()

        setStudents((prev) => [...prev, newStudent])
        setFormData({ mssv: '', name: '', email: '' })
      } else {
        const errData = await response.json().catch(() => ({}))
        console.error('Lỗi chi tiết từ Backend:', errData)
        alert('Thêm thất bại, vui lòng kiểm tra lại backend!')
      }
    } catch (error) {
      console.error('Lỗi khi gửi dữ liệu:', error)
      alert('Không thể kết nối đến server!')
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Câu 48 & 49: Form nhập MSSV, Họ tên và Email */}
      <section style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Nhập thông tin sinh viên</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>MSSV:</label>
            <input
              type="text"
              name="mssv"
              value={formData.mssv}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              required
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Họ và Tên:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              required
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              required
            />
          </div>
          <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>
            Lưu thông tin
          </button>
        </form>
      </section>

      {/* Câu 47: Hiển thị danh sách sinh viên từ API */}
      <section style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Danh sách sinh viên</h2>
        {students.length === 0 ? (
          <p>Không có dữ liệu hoặc đang tải...</p>
        ) : (
          <ul style={{ paddingLeft: '20px' }}>
            {students.map((student, index) => (
              <li key={student._id || student.id || index} style={{ marginBottom: '8px' }}>
                <strong>{student.studentId || student.mssv || student.studentCode}</strong> - {student.name || student.fullName} ({student.email})
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default App