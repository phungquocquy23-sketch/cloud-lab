import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [students, setStudents] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    mssv: '',
    name: '',
    email: ''
  })

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students')
      if (!res.ok) {
        throw new Error('Không thể tải danh sách sinh viên')
      }
      const data = await res.json()
      setStudents(data)
    } catch (err) {
      console.error('Lỗi khi tải danh sách sinh viên:', err)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const resetForm = () => {
    setFormData({ mssv: '', name: '', email: '' })
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      studentId: formData.mssv,
      name: formData.name,
      email: formData.email
    }

    const isEditMode = Boolean(editingId)
    const url = isEditMode ? `/api/students/${editingId}` : '/api/students'
    const method = isEditMode ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || 'Yêu cầu thất bại')
      }

      const savedStudent = await response.json()

      if (isEditMode) {
        setStudents((prev) =>
          prev.map((student) =>
            (student._id || student.id || student.studentId) === editingId ? savedStudent : student
          )
        )
        alert('Cập nhật sinh viên thành công!')
      } else {
        setStudents((prev) => [...prev, savedStudent])
        alert('Thêm sinh viên thành công!')
      }

      resetForm()
    } catch (error) {
      console.error('Lỗi khi gửi dữ liệu:', error)
      alert(isEditMode ? 'Cập nhật thất bại, vui lòng kiểm tra lại backend!' : 'Thêm thất bại, vui lòng kiểm tra lại backend!')
    }
  }

  const handleEdit = (student) => {
    const id = student._id || student.id
    setEditingId(id)
    setFormData({
      mssv: student.studentId || student.mssv || '',
      name: student.name || student.fullName || '',
      email: student.email || ''
    })
  }

  const handleDelete = async (student) => {
    const studentId = student._id || student.id

    if (!studentId) {
      alert('Không xác định được sinh viên cần xoá!')
      return
    }

    const confirmDelete = window.confirm(`Bạn có chắc muốn xoá sinh viên ${student.name || student.studentId}?`)
    if (!confirmDelete) return

    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || 'Xoá thất bại')
      }

      setStudents((prev) =>
        prev.filter((item) => (item._id || item.id || item.studentId) !== studentId)
      )
      if (editingId === studentId) {
        resetForm()
      }
      alert('Xoá sinh viên thành công!')
    } catch (error) {
      console.error('Lỗi khi xoá sinh viên:', error)
      alert('Xoá thất bại, vui lòng thử lại!')
    }
  }

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <section style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>{editingId ? 'Cập nhật thông tin sinh viên' : 'Nhập thông tin sinh viên'}</h2>
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
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>
              {editingId ? 'Cập nhật' : 'Lưu thông tin'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                Huỷ
              </button>
            )}
          </div>
        </form>
      </section>

      <section style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Danh sách sinh viên</h2>
        {students.length === 0 ? (
          <p>Không có dữ liệu hoặc đang tải...</p>
        ) : (
          <ul style={{ paddingLeft: '20px' }}>
            {students.map((student, index) => {
              const studentKey = student._id || student.id || student.studentId || index

              return (
                <li key={studentKey} style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <span>
                    <strong>{student.studentId || student.mssv || student.studentCode}</strong> - {student.name || student.fullName} ({student.email})
                  </span>
                  <span style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => handleEdit(student)} style={{ cursor: 'pointer' }}>
                      Sửa
                    </button>
                    <button type="button" onClick={() => handleDelete(student)} style={{ cursor: 'pointer' }}>
                      Xoá
                    </button>
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

export default App