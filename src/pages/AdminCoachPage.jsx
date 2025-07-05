import { useEffect, useState } from "react";
import axios from "../utils/axios";
import "../cssFiles/adminCoach.css";

const AdminCoachPage = () => {
  const [coaches, setCoaches] = useState([]);
  const [students, setStudents] = useState([]);
  const [editingCoach, setEditingCoach] = useState(null);
  const [formData, setFormData] = useState({
  name: "",
  email: "",
  password: "default123",
  subject: "",
  description: "",
  imageFile: null,
});
  const [assigningCoach, setAssigningCoach] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const fetchCoaches = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/admin/coaches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoaches(res.data);
    } catch (err) {
      console.error("Koçlar alınamadı:", err);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const studentList = res.data.filter((user) => user.role === "student");
      setStudents(studentList);
    } catch (err) {
      console.error("Öğrenci listesi alınamadı:", err);
    }
  };

  useEffect(() => {
    fetchCoaches();
    fetchStudents();
  }, []);

 const handleSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");

  try {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("subject", formData.subject);
    data.append("description", formData.description);
    if (formData.imageFile) {
      data.append("image", formData.imageFile);
    }

    const res = await axios.post("/api/admin/coaches", data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    alert("Koç başarıyla oluşturuldu.");
    setFormData({
      name: "",
      email: "",
      subject: "",
      description: "",
      imageFile: null,
    });
    fetchCoaches();
  } catch (err) {
    console.error("Koç oluşturulamadı:", err.response?.data || err.message);
    alert("Koç oluşturulurken bir hata oluştu.");
  }
};


  const handleEdit = (coach) => {
    setEditingCoach(coach);
    setFormData({
      name: coach.name,
      subject: coach.subject,
      description: coach.description,
      imageFile: null,
    });
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/admin/coaches/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCoaches();
    } catch (err) {
      console.error("Koç silinemedi:", err);
    }
  };

  // Koç atama API çağrısı
  const handleAssignCoach = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/admin/assign-coach",
        {
          userId: parseInt(selectedStudentId),
          coachId: assigningCoach.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Koç başarıyla atandı.");
      setAssigningCoach(null);
      setSelectedStudentId("");
    } catch (error) {
      console.error("Koç atama hatası:", error);
      alert("Koç atama işlemi başarısız oldu.");
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const coachesPerPage = 6;

  // Koçları sayfalara böl
  const indexOfLastCoach = currentPage * coachesPerPage;
  const indexOfFirstCoach = indexOfLastCoach - coachesPerPage;
  const currentCoaches = coaches.slice(indexOfFirstCoach, indexOfLastCoach);

  // Toplam sayfa sayısı
  const totalPages = Math.ceil(coaches.length / coachesPerPage);

  // Sayfa değiştirici
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Koç Yönetimi</h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 mb-6 bg-white p-4 rounded shadow"
        encType="multipart/form-data"
      >
        <input
  type="text"
  placeholder="Kullanıcı Adı (Ad Soyad)"
  value={formData.name}
onChange={(e) => setFormData({ ...formData, name: e.target.value })}
  className="border p-2 w-full"
  required
/>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="border p-2 w-full"
          required
        />
        <input
          type="text"
          placeholder="Branş (Matematik vb.)"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="border p-2 w-full"
        />
        <textarea
          placeholder="Açıklama"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="border p-2 w-full"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setFormData({ ...formData, imageFile: e.target.files[0] })
          }
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingCoach ? "Güncelle" : "Ekle"}
        </button>
      </form>

      <div className="coach-grid">
        {currentCoaches.map((coach) => (
          <div key={coach.id} className="coach-card">
            <img
              src={`http://localhost:5000${coach.image}`}
              alt={coach.name}
              className="coach-image"
            />
            <div className="coach-info">
              <h3 className="coach-name">{coach.name}</h3>
              <p className="coach-subject">{coach.subject}</p>
              <p className="coach-description">{coach.description}</p>
              <div className="coach-actions">
                <button onClick={() => handleEdit(coach)} className="edit-btn">
                  ✏️ Düzenle
                </button>
                <button onClick={() => handleDelete(coach.id)} className="delete-btn">
                  🗑 Sil
                </button>
                {/* Öğrenciye Ata Butonu */}
                <button
                  onClick={() => setAssigningCoach(coach)}
                  className="assign-btn"
                >
                  👥 Öğrenciye Ata
                </button>
               {coach.assignedTo && coach.assignedTo.length > 0 && (
  <div className="assigned-students mt-2">
    <strong>Atanmış Öğrenciler:</strong>
    <ul className="list-disc list-inside text-sm text-gray-700">
      {coach.assignedTo.map((student) => (
        <li key={student.id}>
          {student.name} ({student.email})
        </li>
      ))}
    </ul>
  </div>
)}

              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => paginate(currentPage - 1)}
        >
          ‹ Önceki
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={currentPage === i + 1 ? "active-page" : ""}
            onClick={() => paginate(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => paginate(currentPage + 1)}
        >
          Sonraki ›
        </button>
      </div>

      {/* Öğrenciye Ata Modal */}
      {assigningCoach && (
        <>
          <div
            className="modal-overlay"
            onClick={() => {
              setAssigningCoach(null);
              setSelectedStudentId("");
            }}
          ></div>
          <div className="modal-content show">
            <h3>
              {assigningCoach.name} koçunu öğrenciye ata
            </h3>
            <label>Öğrenci Seç:</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">-- Öğrenci seçin --</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
            <div className="modal-actions">
              <button onClick={handleAssignCoach} disabled={!selectedStudentId}>
                💾 Ata
              </button>
              <button
                onClick={() => {
                  setAssigningCoach(null);
                  setSelectedStudentId("");
                }}
              >
                İptal
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminCoachPage;
