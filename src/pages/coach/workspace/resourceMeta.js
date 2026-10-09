import { FaBook, FaClipboardList, FaFileAlt } from "react-icons/fa";
import {
  TYT_SUBJECTS,
  LGS_SUBJECTS,
  AYT_SUBJECTS_BY_TRACK,
  AYT_SUBJECTS_ALL,
  RECOGNIZED_TRACKS,
} from "../../../config/academicSubjects";

// Koç → Öğrenci Kaynak Atama — tür/sınav sabitleri backend'deki
// coach.controller.js#RESOURCE_TYPES / RESOURCE_EXAM_TYPES ile birebir
// aynı kalmalı (orası source of truth, burada yalnızca UI label'ları var).
export const RESOURCE_TYPES = ["BOOK", "MOCK_EXAM", "BRANCH_MOCK", "FASCICLE", "OTHER"];
export const RESOURCE_EXAM_TYPES = ["TYT", "AYT", "LGS"];
export const RESOURCE_SUBJECT_REQUIRED_TYPES = new Set(["BOOK", "BRANCH_MOCK", "FASCICLE"]);

// Sade icon set (react-icons/fa — projede zaten kullanılan kütüphane;
// lucide-react kurulu ama hiç kullanılmıyor, tutarlılık için buna geçilmedi).
export const TYPE_META = {
  BOOK: { label: "Kitap / Soru Bankası", icon: FaBook },
  MOCK_EXAM: { label: "Genel Deneme", icon: FaClipboardList },
  BRANCH_MOCK: { label: "Branş Denemesi", icon: FaClipboardList },
  FASCICLE: { label: "Fasikül", icon: FaFileAlt },
  OTHER: { label: "Diğer", icon: FaFileAlt },
};

// AYT'de track tanınmıyorsa (null/boş/geçersiz) VEYA track'in AYT ders
// listesi boşsa (ör. "Dil") formu kilitlemek yerine tüm track'lerin
// birleşimini gösteriyoruz — koç her zaman bir ders seçebilmeli (K5).
export function getSubjectOptions(examType, studentTrack) {
  if (examType === "TYT") return TYT_SUBJECTS;
  if (examType === "LGS") return LGS_SUBJECTS;
  if (examType === "AYT") {
    if (RECOGNIZED_TRACKS.includes(studentTrack)) {
      const list = AYT_SUBJECTS_BY_TRACK[studentTrack];
      if (list.length > 0) return list;
    }
    return AYT_SUBJECTS_ALL;
  }
  return [];
}
