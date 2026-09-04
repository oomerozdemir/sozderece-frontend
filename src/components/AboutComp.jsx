import { motion } from "framer-motion";
import Footer from "./Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faEye,
  faUserGraduate,
  faChartLine,
  faUserFriends,
  faHandshake,
  faLightbulb,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const AboutComp = () => {
  return (
    <motion.div
      className="flex flex-col font-poppins"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
    >
      {/* === HERO SECTION === */}
      <section className="bg-gradient-to-b from-[#b89f9f] to-[#080894] text-white py-[100px] px-5 text-center max-[768px]:py-[56px] max-[768px]:px-4">
        <div className="max-w-[800px] mx-auto">
          <h1 className="text-[2.5rem] mb-5 text-[#031083] max-[768px]:text-[1rem] max-[768px]:mb-3">Hakkımızda: YKS ve LGS Koçluğunda Sözderece Farkı</h1>
          <p className="text-[1.1rem] text-[#ccc] max-[768px]:text-[0.8rem] max-[768px]:leading-[1.5]">
            Sözderece'yi kuran fikir basit: sınavı yeni kazanmış, süreci hâlâ
            hatırlayan biriyle çalışmak, konuyu yıllar önce unutmuş biriyle
            çalışmaktan farklı sonuç verir. Koçlarımızın tamamı YKS veya
            LGS'de derece yapmış öğrenciler — sana sadece ne çalışman
            gerektiğini değil, o sınava nasıl hazırlanman gerektiğini de
            söylüyorlar, çünkü aynı masadan geçtiler.
          </p>
        </div>
      </section>

      {/* === MISSION & VISION === */}
      <section className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[30px] py-[80px] px-5 bg-[#f4f4f4] max-w-[1200px] mx-auto w-full max-[768px]:gap-4 max-[768px]:py-10 max-[768px]:px-4 max-[768px]:grid-cols-1">
        <div className="bg-white rounded-xl p-[30px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-transform hover:-translate-y-[5px] hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] max-[768px]:p-[18px] max-[768px]:rounded-[10px]">
          <h2 className="text-[#1e1e50] text-[1.8rem] mb-[15px] max-[768px]:text-[1rem] max-[768px]:mb-[10px]">Misyonumuz</h2>
          <p className="text-base text-[#444] leading-[1.6] max-[768px]:text-[0.8rem] max-[768px]:leading-[1.5]">
            Bir öğrencinin sınava hazır olup olmadığını sınavdan bir ay önce
            değil, ilk haftadan itibaren görmek. Haftalık deneme analizleriyle
            nerede tıkandığını erken fark edip, programı ona göre değiştirmek.
          </p>
        </div>
        <div className="bg-white rounded-xl p-[30px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-transform hover:-translate-y-[5px] hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] max-[768px]:p-[18px] max-[768px]:rounded-[10px]">
          <h2 className="text-[#1e1e50] text-[1.8rem] mb-[15px] max-[768px]:text-[1rem] max-[768px]:mb-[10px]">Vizyonumuz</h2>
          <p className="text-base text-[#444] leading-[1.6] max-[768px]:text-[0.8rem] max-[768px]:leading-[1.5]">
            Büyük şehirde ya da taşrada yaşamanın, hangi koça ulaşabildiğini
            belirlemediği bir sistem kurmak — Türkiye'nin her yerinden
            öğrenciye aynı kalitede birebir koçluk sunmak.
          </p>
        </div>
        <div className="bg-white rounded-xl p-[30px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-transform hover:-translate-y-[5px] hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] max-[768px]:p-[18px] max-[768px]:rounded-[10px]">
          <h2 className="text-[#1e1e50] text-[1.8rem] mb-[15px] max-[768px]:text-[1rem] max-[768px]:mb-[10px]">Değerlerimiz</h2>
          <p className="text-base text-[#444] leading-[1.6] max-[768px]:text-[0.8rem] max-[768px]:leading-[1.5]">
            Bir koçu işe alırken önce derece yapıp yapmadığına bakıyoruz,
            sonra iletişim becerisine. İkisi bir arada olmadan koçumuz olamaz.
          </p>
        </div>
      </section>

      {/* === Coaching System === */}
      <section className="flex flex-wrap items-center py-[80px] px-5 gap-[40px] bg-white max-w-[1200px] mx-auto w-full max-[768px]:gap-5 max-[768px]:py-10 max-[768px]:px-4">
        <div className="flex-[1_1_400px] text-center max-[768px]:flex-[1_1_100%]">
          <img
            src="/images/teaching.svg"
            alt="Öğretmen ve öğrenci koçluk sistemi görseli"
            className="w-full max-w-[500px] rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.1)] max-[768px]:max-w-[300px] max-[768px]:rounded-xl"
            loading="lazy"
          />
        </div>
        <div className="flex-[1_1_400px] max-[768px]:flex-[1_1_100%]">
          <h2 className="text-[2rem] text-[#1e1e50] mb-5 max-[768px]:text-[1rem] max-[768px]:mb-3">Koçluk Sistemimiz</h2>
          <p className="text-base leading-[1.6] text-[#444] mb-[25px] max-[768px]:text-[0.8rem] max-[768px]:leading-[1.6] max-[768px]:mb-4">
            Satın alma sonrası 24 saat içinde eğitim danışmanımız arar,
            seviyeni analiz eder ve sana bir koç atar — aynı gün ilk haftalık
            programın hazır olur. İlk 5 gün içinde koçundan memnun kalmazsan
            koşulsuz değiştirebilirsin; sonrasında da bu hak her zaman senindir.
            Ve koçun sadece haftada bir görüşüp kaybolmaz — gün boyu arayabilir,
            görüntülü konuşabilir, yazabilirsin.
          </p>
        </div>

        <div className="mt-[30px] grid grid-cols-1 gap-5 md:grid-cols-3 w-full max-[768px]:gap-[14px]">
          <div className="flex items-start gap-[15px] max-[768px]:gap-[10px]">
            <FontAwesomeIcon icon={faUserFriends} className="text-[1.8rem] text-[#f97316] mt-1 max-[768px]:text-[1.2rem] max-[768px]:mt-0.5" />
            <p className="m-0 text-[#444] leading-[1.5] max-[768px]:text-[0.8rem] max-[768px]:leading-[1.45]">
              Koçların yaş farkı genelde sadece birkaç yıl — öğretmen değil,
              o yolu daha yeni yürümüş bir abi/abla gibi konuşurlar.
            </p>
          </div>
          <div className="flex items-start gap-[15px] max-[768px]:gap-[10px]">
            <FontAwesomeIcon icon={faHandshake} className="text-[1.8rem] text-[#f97316] mt-1 max-[768px]:text-[1.2rem] max-[768px]:mt-0.5" />
            <p className="m-0 text-[#444] leading-[1.5] max-[768px]:text-[0.8rem] max-[768px]:leading-[1.45]">Her koç sınırlı sayıda öğrenciyle çalışır; kalabalık bir sınıfta kaybolmazsın.</p>
          </div>
          <div className="flex items-start gap-[15px] max-[768px]:gap-[10px]">
            <FontAwesomeIcon icon={faLightbulb} className="text-[1.8rem] text-[#f97316] mt-1 max-[768px]:text-[1.2rem] max-[768px]:mt-0.5" />
            <p className="m-0 text-[#444] leading-[1.5] max-[768px]:text-[0.8rem] max-[768px]:leading-[1.45]">
              Verim düştüğünde ya da moralin bozulduğunda ilk fark eden koçun
              olur, ders programı değil.
            </p>
          </div>
        </div>
      </section>

      {/* === Team === */}
      <section className="bg-[#f9fafb] py-[60px] px-5 text-center rounded-2xl mt-[60px] max-w-[1200px] mx-auto w-full max-[768px]:py-9 max-[768px]:px-4 max-[768px]:mt-9 max-[768px]:rounded-xl">
        <h2 className="text-[2rem] mb-4 text-[#1f2937] max-[768px]:text-[1rem] max-[768px]:mb-[10px]">Koçluk Ekibimiz</h2>
        <p className="text-base text-[#374151] max-w-[700px] mx-auto mb-6 leading-[1.6] max-[768px]:text-[0.8rem] max-[768px]:leading-[1.55] max-[768px]:max-w-full max-[768px]:mb-4">
          Her koçumuz kendi sınavında derece yapmış, hangi üniversitede
          okuduğu ve sınavda kaçıncı sırayı aldığı ekip sayfasında yazıyor.
          Kimin seninle çalışacağını görüp karar verebilirsin.
        </p>

        <Link to="/ekibimiz" className="inline-block bg-[#000ed3] text-white py-3 px-6 rounded-lg font-semibold no-underline transition hover:bg-[#ea580c] max-[768px]:py-[10px] max-[768px]:px-[18px] max-[768px]:text-[0.9rem]">
          Koçlarımız Hakkında Daha Fazla Bilgi
        </Link>
      </section>

      {/* === Values === */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-[30px] py-[60px] px-5 max-w-[1200px] mx-auto w-full max-[768px]:gap-4 max-[768px]:py-8 max-[768px]:px-4 max-[768px]:grid-cols-1">
        <div className="bg-[#f4f8ff] py-[30px] px-5 rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.06)] transition-transform hover:-translate-y-[5px] max-[768px]:py-[18px] max-[768px]:px-[14px] max-[768px]:rounded-[10px]">
          <FontAwesomeIcon icon={faLock} className="text-[2rem] text-[#0057b8] mb-[15px] max-[768px]:text-[1.4rem] max-[768px]:mb-[10px]" />
          <h3 className="text-[#0057b8] text-[1.4rem] mb-[10px] max-[768px]:text-[0.95rem] max-[768px]:mb-2">Gizlilik</h3>
          <p className="text-[#333] text-base max-[768px]:text-[0.8rem]">
            Deneme sonuçların, ders kayıtların ve veli görüşmelerin sadece
            senin koçunla ve KVKK'ya uygun şekilde saklanır, üçüncü kişiyle
            paylaşılmaz.
          </p>
        </div>
        <div className="bg-[#f4f8ff] py-[30px] px-5 rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.06)] transition-transform hover:-translate-y-[5px] max-[768px]:py-[18px] max-[768px]:px-[14px] max-[768px]:rounded-[10px]">
          <FontAwesomeIcon icon={faEye} className="text-[2rem] text-[#0057b8] mb-[15px] max-[768px]:text-[1.4rem] max-[768px]:mb-[10px]" />
          <h3 className="text-[#0057b8] text-[1.4rem] mb-[10px] max-[768px]:text-[0.95rem] max-[768px]:mb-2">Şeffaflık</h3>
          <p className="text-[#333] text-base max-[768px]:text-[0.8rem]">
            Her hafta ne çalışıldığı, hangi konunun eksik kaldığı veliye
            raporlanır — süreç sadece öğrenci ve koç arasında kapalı kapılar
            ardında ilerlemez.
          </p>
        </div>
        <div className="bg-[#f4f8ff] py-[30px] px-5 rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.06)] transition-transform hover:-translate-y-[5px] max-[768px]:py-[18px] max-[768px]:px-[14px] max-[768px]:rounded-[10px]">
          <FontAwesomeIcon icon={faUserGraduate} className="text-[2rem] text-[#0057b8] mb-[15px] max-[768px]:text-[1.4rem] max-[768px]:mb-[10px]" />
          <h3 className="text-[#0057b8] text-[1.4rem] mb-[10px] max-[768px]:text-[0.95rem] max-[768px]:mb-2">Öğrenci Odaklılık</h3>
          <p className="text-[#333] text-base max-[768px]:text-[0.8rem]">
            Program hazır bir şablon değil; öğrencinin sınıfına, sınavına ve
            zayıf olduğu konulara göre her hafta yeniden şekillenir.
          </p>
        </div>
        <div className="bg-[#f4f8ff] py-[30px] px-5 rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.06)] transition-transform hover:-translate-y-[5px] max-[768px]:py-[18px] max-[768px]:px-[14px] max-[768px]:rounded-[10px]">
          <FontAwesomeIcon icon={faChartLine} className="text-[2rem] text-[#0057b8] mb-[15px] max-[768px]:text-[1.4rem] max-[768px]:mb-[10px]" />
          <h3 className="text-[#0057b8] text-[1.4rem] mb-[10px] max-[768px]:text-[0.95rem] max-[768px]:mb-2">Sürekli Gelişim</h3>
          <p className="text-[#333] text-base max-[768px]:text-[0.8rem]">Her deneme analizinden sonra program gözden geçirilir; işe yaramayan yöntem bir sonraki haftaya taşınmaz.</p>
        </div>
      </div>

      {/* === CTA === */}
      <section className="bg-gradient-to-br from-brand-navy-dark to-[#1e3a8a] py-[80px] px-5 text-white text-center max-[768px]:py-11 max-[768px]:px-4">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col items-center gap-5 max-[768px]:gap-3 max-[768px]:items-center max-[768px]:text-center">
          <div>
            <h2 className="text-[2.2rem] mb-[10px] text-white max-[768px]:text-[1rem] max-[768px]:mb-2">Hedeflerinize birlikte ulaşalım</h2>
            <p className="text-[1.2rem] text-[#d1d5db] max-w-[600px] max-[768px]:text-[0.8rem] max-[768px]:leading-[1.55] max-[768px]:max-w-full">
              Ücretsiz ön görüşme için formu doldurarak, size özel koçluk
              sürecinizi başlatalım.
            </p>
          </div>
          <Link
            to="/ucretsiz-on-gorusme"
            className="bg-white text-black py-[14px] px-[28px] rounded-[10px] font-bold text-[1.1rem] no-underline transition max-[768px]:py-[10px] max-[768px]:px-[18px] max-[768px]:text-[0.9rem] max-[768px]:rounded-lg"
            aria-label="Ön analiz randevusu oluştur"
          >
            Ön Analiz Randevusu Oluştur
          </Link>
        </div>
        <p className="max-w-[900px] mx-auto mt-[18px] mb-10 px-5 text-base leading-[1.6] text-center text-[#e5e7eb] max-[768px]:mt-3 max-[768px]:mb-7 max-[768px]:text-[0.95rem] max-[768px]:px-[14px]">
          <Link to="/sss" className="text-white font-semibold no-underline border-b-2 border-transparent transition mx-1 hover:text-[#fbbf24] hover:border-[rgba(251,191,36,0.9)]">Sıkça Sorulan Sorular</Link> sayfasına göz atabilir veya{" "}
          <Link to="/paket-detay" className="text-white font-semibold no-underline border-b-2 border-transparent transition mx-1 hover:text-[#fbbf24] hover:border-[rgba(251,191,36,0.9)]">koçluk paketlerimizi</Link> inceleyebilirsiniz.
        </p>
      </section>

      <Footer />
    </motion.div>
  );
};

export default AboutComp;
