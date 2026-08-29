const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Sử dụng path.resolve để đảm bảo luôn tìm đúng file .env dù chạy từ thư mục nào
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Student = require('./models/student');

const app = express();
const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối MongoDB trước khi mở cổng để tránh request bị buffering khi database chưa sẵn sàng.
const startServer = async () => {
  if (!mongoUri) {
    throw new Error('Thiếu biến môi trường MONGODB_URI. Hãy tạo file mern-demo/.env.');
  }

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  console.log(">>> MongoDB Atlas connected successfully!");

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("MongoDB connection error:", err.message);
  process.exitCode = 1;
});

// Route kiểm tra backend
app.get('/api/hello', (req, res) => {
  res.json({ message: "Backend đang hoạt động!" });
});

// CÂU 36: Lấy danh sách sinh viên (GET)
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ:', error: error.message });
  }
});

// CÂU 37: Thêm sinh viên (POST)
app.post('/api/students', async (req, res) => {
  try {
    const studentData = {
      studentId: req.body.studentId || req.body.mssv || req.body.studentCode,
      name: req.body.name || req.body.fullName,
      email: req.body.email
    };

    if (!studentData.studentId || !studentData.name || !studentData.email) {
      return res.status(400).json({
        message: 'Thiếu dữ liệu bắt buộc: studentId, name, email.'
      });
    }

    const newStudent = await Student.create(studentData);
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi thêm sinh viên:', error: error.message });
  }
});

// CÂU 38: Cập nhật sinh viên (PUT)
app.put('/api/students/:id', async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên!' });
    }

    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi cập nhật sinh viên:', error: error.message });
  }
});

// CÂU 39: Xóa sinh viên (DELETE)
app.delete('/api/students/:id', async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);

    if (!deletedStudent) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên để xóa!' });
    }

    res.status(200).json({ message: 'Xóa sinh viên thành công!', student: deletedStudent });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa sinh viên:', error: error.message });
  }
});
