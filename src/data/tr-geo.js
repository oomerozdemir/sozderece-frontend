// src/data/tr-geo.js

export const TR_CITIES = [
  "Adana","Adıyaman","Afyonkarahisar","Ağrı","Aksaray","Amasya","Ankara","Antalya","Ardahan","Artvin",
  "Aydın","Balıkesir","Bartın","Batman","Bayburt","Bilecik","Bingöl","Bitlis","Bolu","Burdur",
  "Bursa","Çanakkale","Çankırı","Çorum","Denizli","Diyarbakır","Düzce","Edirne","Elazığ","Erzincan",
  "Erzurum","Eskişehir","Gaziantep","Giresun","Gümüşhane","Hakkâri","Hatay","Iğdır","Isparta","İstanbul",
  "İzmir","Kahramanmaraş","Karabük","Karaman","Kars","Kastamonu","Kayseri","Kırıkkale","Kırklareli","Kırşehir",
  "Kilis","Kocaeli","Konya","Kütahya","Malatya","Manisa","Mardin","Mersin","Muğla","Muş",
  "Nevşehir","Niğde","Ordu","Osmaniye","Rize","Sakarya","Samsun","Siirt","Sinop","Sivas",
  "Şanlıurfa","Şırnak","Tekirdağ","Tokat","Trabzon","Tunceli","Uşak","Van","Yalova","Yozgat","Zonguldak"
];

// İl -> ilçe listesi (örnekler; gerektikçe genişlet)
export const TR_DISTRICTS = {
  "Adana": ["Seyhan","Yüreğir","Çukurova","Sarıçam","Ceyhan","Kozan","İmamoğlu","Karataş","Karaisalı","Pozantı","Aladağ","Feke","Saimbeyli","Tufanbeyli","Yumurtalık"],
  "Ankara": ["Çankaya","Keçiören","Yenimahalle","Mamak","Etimesgut","Sincan","Altındağ","Pursaklar","Gölbaşı","Polatlı","Kahramankazan","Beypazarı","Elmadağ","Ayaş","Çubuk","Akyurt","Haymana","Kızılcahamam","Şereflikoçhisar","Evren","Nallıhan","Kalecik","Bala"],
  "Antalya": ["Kepez","Muratpaşa","Konyaaltı","Alanya","Manavgat","Serik","Aksu","Döşemealtı","Kemer","Kumluca","Finike","Demre","Gazipaşa","İbradı","Gündoğmuş","Kaş","Elmalı","Akseki"],
  "Bursa": ["Osmangazi","Yıldırım","Nilüfer","İnegöl","Gemlik","Mudanya","Gürsu","Kestel","Karacabey","Mustafakemalpaşa","Orhangazi","Yenişehir","İznik","Orhaneli","Büyükorhan","Keles","Harmancık"],
  "İstanbul": ["Adalar","Arnavutköy","Ataşehir","Avcılar","Bağcılar","Bahçelievler","Bakırköy","Başakşehir","Bayrampaşa","Beşiktaş","Beykoz","Beylikdüzü","Beyoğlu","Büyükçekmece","Çatalca","Çekmeköy","Esenler","Esenyurt","Eyüpsultan","Fatih","Gaziosmanpaşa","Güngören","Kadıköy","Kağıthane","Kartal","Küçükçekmece","Maltepe","Pendik","Sancaktepe","Sarıyer","Silivri","Sultanbeyli","Sultangazi","Şile","Şişli","Tuzla","Ümraniye","Üsküdar","Zeytinburnu"],
  "İzmir": ["Konak","Karşıyaka","Bornova","Buca","Bayraklı","Karabağlar","Gaziemir","Çiğli","Narlıdere","Balçova","Güzelbahçe","Torbalı","Menemen","Foça","Aliağa","Bergama","Dikili","Kınık","Karaburun","Urla","Seferihisar","Menderes","Selçuk","Tire","Ödemiş","Beydağ","Kiraz"],
  "Kocaeli": ["İzmit","Gebze","Gölcük","Kartepe","Başiskele","Çayırova","Darıca","Dilovası","Derince","Karamürsel","Kandıra"],
  "Konya": ["Selçuklu","Meram","Karatay","Ereğli","Akşehir","Beyşehir","Seydişehir","Ilgın","Cihanbeyli","Kulu","Doğanhisar","Kadınhanı","Bozkır","Çumra","Karapınar","Hüyük","Altınekin","Hadim","Taşkent","Yalıhüyük","Derebucak","Ahırlı","Emirgazi","Güneysınır","Tuzlukçu","Sarayönü"],
  "Sakarya": ["Adapazarı","Serdivan","Erenler","Arifiye","Hendek","Akyazı","Karasu","Kocaali","Kaynarca","Ferizli","Söğütlü","Pamukova","Sapanca","Geyve","Taraklı"],
  "Trabzon": ["Ortahisar","Akçaabat","Yomra","Arsin","Araklı","Of","Beşikdüzü","Vakfıkebir","Çarşıbaşı","Sürmene","Maçka","Tonya","Şalpazarı","Düzköy","Çaykara","Dernekpazarı","Köprübaşı","Hayrat"],
  // Diğer iller (geçici): ilçe listesini sonra ekleyebilirsin
  "Adıyaman": [], "Afyonkarahisar": [], "Ağrı": [], "Aksaray": [], "Amasya": [],
  "Ardahan": [], "Artvin": [], "Aydın": [], "Balıkesir": [], "Bartın": [], "Batman": [], "Bayburt": [], "Bilecik": [], "Bingöl": [], "Bitlis": [], "Bolu": [], "Burdur": [],
  "Çanakkale": [], "Çankırı": [], "Çorum": [], "Denizli": [], "Diyarbakır": [], "Düzce": [], "Edirne": [], "Elazığ": [], "Erzincan": [], "Erzurum": [], "Eskişehir": [],
  "Gaziantep": [], "Giresun": [], "Gümüşhane": [], "Hakkâri": [], "Hatay": [], "Iğdır": [], "Isparta": [], "Kahramanmaraş": [], "Karabük": [], "Karaman": [], "Kars": [], "Kastamonu": [], "Kayseri": [], "Kırıkkale": [], "Kırklareli": [], "Kırşehir": [], "Kilis": [],
  "Kütahya": [], "Malatya": [], "Manisa": [], "Mardin": [], "Mersin": [], "Muğla": [], "Muş": [], "Nevşehir": [], "Niğde": [], "Ordu": [], "Osmaniye": [], "Rize": [], "Samsun": [], "Siirt": [], "Sinop": [], "Sivas": [], "Şanlıurfa": [], "Şırnak": [], "Tekirdağ": [], "Tokat": [], "Tunceli": [], "Uşak": [], "Van": [], "Yalova": [], "Yozgat": [], "Zonguldak": []
};
