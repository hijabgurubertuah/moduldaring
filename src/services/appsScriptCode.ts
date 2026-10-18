// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

export const APPS_SCRIPT_TEMPLATE = `/**
 * Google Apps Script - Backend Modul Belajar Daring
 * SMP NEGERI 1 BENGKALIS
 * 
 * Petunjuk Konfigurasi:
 * 1. Masukkan TOKEN_RAHASIA, SPREADSHEET_ID, dan DRIVE_FOLDER_ID di bawah ini.
 * 2. Deploy sebagai Web App:
 *    - Execute as: Me (akun Anda)
 *    - Who has access: Anyone (Siapa saja)
 * 3. Salin URL Web App yang dihasilkan ke menu Sinkronisasi di panel Admin.
 */

var CONFIG = {
  TOKEN: "GANTI_DENGAN_TOKEN_RAHASIA_ANDA",
  SPREADSHEET_ID: "GANTI_DENGAN_SPREADSHEET_ID_ANDA",
  DRIVE_FOLDER_ID: "GANTI_DENGAN_DRIVE_FOLDER_ID_ANDA",
  SHEET_SISWA: "Siswa",
  SHEET_NILAI: "Rekap Nilai"
};

var HEADERS_NILAI = [
  "NISN",
  "Nama",
  "Kelas",
  "Mata Pelajaran",
  "ID Materi",
  "Materi",
  "Uji Pemahaman",
  "Kuis Akhir",
  "Nilai Akhir",
  "Predikat",
  "Diperbarui"
];

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var params = {};
    if (e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (err) {
        params = e.parameter || {};
      }
    } else {
      params = e.parameter || {};
    }

    var action = params.action;
    var result = { success: false, error: "Aksi tidak dikenal" };

    // --- AKSI PUBLIK SISWA (TANPA TOKEN) ---
    if (action === "verifyNisn") {
      result = verifyStudentNisn(params.nisn);
    } else if (action === "getStudentGrades") {
      result = getStudentGradesByNisn(params.nisn);
    } else if (action === "saveStudentGrade") {
      result = saveStudentEvaluationGrade(params.record);
    } else if (action === "getImage") {
      result = getDriveImageBase64(params.fileId);
    } 
    // --- AKSI STAF / ADMIN (DENGAN TOKEN) ---
    else {
      var userToken = params.token || (e.parameter && e.parameter.token);
      if (!userToken || userToken !== CONFIG.TOKEN) {
        return createResponse({ success: false, error: "Akses tidak sah" });
      }

      if (action === "testConnection") {
        result = { success: true, message: "Terhubung" };
      } else if (action === "getStudents") {
        result = getAllStudents();
      } else if (action === "addStudent") {
        result = addStudentData(params.student);
      } else if (action === "updateStudent") {
        result = updateStudentData(params.student);
      } else if (action === "deleteStudent") {
        result = deleteStudentData(params.nisn);
      } else if (action === "importStudents") {
        result = importStudentsData(params.students);
      } else if (action === "getGrades") {
        result = getAllGradesRecords();
      } else if (action === "uploadFile") {
        result = uploadFileToDrive(params.fileName, params.mimeType, params.base64Data);
      } else if (action === "deleteFile") {
        result = deleteFileFromDrive(params.fileId);
      }
    }

    return createResponse(result);
  } catch (error) {
    return createResponse({ success: false, error: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheet() {
  if (CONFIG.SPREADSHEET_ID && CONFIG.SPREADSHEET_ID !== "GANTI_DENGAN_SPREADSHEET_ID_ANDA") {
    return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
    }
  } else if (headers && headers.length > 0) {
    // Sesuaikan header jika berbeda
    var currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
    if (currentHeaders.length < headers.length || currentHeaders[0] !== headers[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }
  return sheet;
}

// 1. Verifikasi Siswa (Hanya mengembalikan Nama dan Kelas)
function verifyStudentNisn(nisn) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_SISWA);
  if (!sheet) return { success: false, error: "Data siswa belum tersedia" };

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var rowNisn = String(data[i][1]).trim();
    if (rowNisn === String(nisn).trim()) {
      return {
        success: true,
        data: {
          name: String(data[i][0]).trim(),
          nisn: rowNisn,
          className: String(data[i][2]).trim()
        }
      };
    }
  }
  return { success: false, error: "NISN tidak terdaftar" };
}

// 2. Ambil Nilai Khusus NISN Siswa (Struktur Kolom Baru)
function getStudentGradesByNisn(nisn) {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, CONFIG.SHEET_NILAI, HEADERS_NILAI);
  var data = sheet.getDataRange().getValues();
  var grades = [];
  for (var i = 1; i < data.length; i++) {
    var rowNisn = String(data[i][0]).trim();
    if (rowNisn === String(nisn).trim()) {
      grades.push({
        id: "grd-" + i,
        studentNisn: rowNisn,
        studentName: String(data[i][1]).trim(),
        className: String(data[i][2]).trim(),
        subject: String(data[i][3]).trim(),
        materialId: String(data[i][4]).trim(),
        materialTitle: String(data[i][5]).trim(),
        ujiPemahaman: Number(data[i][6]) || 0,
        kuisAkhir: data[i][7] === "-" ? -1 : (Number(data[i][7]) || 0),
        nilaiAkhir: data[i][8] === "-" ? -1 : (Number(data[i][8]) || 0),
        predikat: String(data[i][9]).trim(),
        updatedAt: String(data[i][10] || "")
      });
    }
  }
  return { success: true, data: grades };
}

// 3. Simpan Nilai Otomatis Milik Siswa (Selalu Menyimpan Nilai Tertinggi)
function saveStudentEvaluationGrade(rec) {
  if (!rec || !rec.studentNisn || !rec.materialId) {
    return { success: false, error: "Data tidak lengkap" };
  }
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, CONFIG.SHEET_NILAI, HEADERS_NILAI);
  var data = sheet.getDataRange().getValues();

  var foundRow = -1;
  var existingUji = 0;
  var existingKuis = -1;

  for (var i = 1; i < data.length; i++) {
    var rowNisn = String(data[i][0]).trim();
    var rowMatId = String(data[i][4]).trim();
    if (rowNisn === String(rec.studentNisn).trim() && rowMatId === String(rec.materialId).trim()) {
      foundRow = i + 1;
      existingUji = Number(data[i][6]) || 0;
      existingKuis = data[i][7] === "-" ? -1 : (Number(data[i][7]) || -1);
      break;
    }
  }

  // Nilai tidak pernah turun
  var finalUji = Math.max(existingUji, Number(rec.ujiPemahaman) || 0);
  var finalKuis = existingKuis;
  if (rec.kuisAkhir !== undefined && rec.kuisAkhir >= 0) {
    finalKuis = Math.max(existingKuis, Number(rec.kuisAkhir));
  }

  var now = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm");
  var rowValues = [
    "'" + rec.studentNisn,
    "'" + rec.studentName,
    "'" + rec.className,
    "'" + rec.subject,
    "'" + rec.materialId,
    "'" + rec.materialTitle,
    finalUji,
    finalKuis < 0 ? "-" : finalKuis,
    rec.nilaiAkhir < 0 ? "-" : rec.nilaiAkhir,
    rec.predikat || "-",
    now
  ];

  if (foundRow > 0) {
    sheet.getRange(foundRow, 1, 1, 11).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return { success: true };
}

// 4. Ambil Seluruh Data Nilai untuk Staf
function getAllGradesRecords() {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, CONFIG.SHEET_NILAI, HEADERS_NILAI);
  var data = sheet.getDataRange().getValues();
  var records = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][4]) {
      records.push({
        id: "grd-" + i,
        studentNisn: String(data[i][0]).trim(),
        studentName: String(data[i][1]).trim(),
        className: String(data[i][2]).trim(),
        subject: String(data[i][3]).trim(),
        materialId: String(data[i][4]).trim(),
        materialTitle: String(data[i][5]).trim(),
        ujiPemahaman: Number(data[i][6]) || 0,
        kuisAkhir: data[i][7] === "-" ? -1 : (Number(data[i][7]) || 0),
        nilaiAkhir: data[i][8] === "-" ? -1 : (Number(data[i][8]) || 0),
        predikat: String(data[i][9]).trim(),
        updatedAt: String(data[i][10] || "")
      });
    }
  }
  return { success: true, data: records };
}

// 5. Ambil Gambar Drive sebagai Base64
function getDriveImageBase64(fileId) {
  try {
    var file = DriveApp.getFileById(fileId);
    var blob = file.getBlob();
    var bytes = blob.getBytes();
    var base64 = Utilities.base64Encode(bytes);
    var mime = blob.getContentType();
    return { success: true, dataUrl: "data:" + mime + ";base64," + base64 };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// 6. Ambil Seluruh Data Siswa (Staff)
function getAllStudents() {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, CONFIG.SHEET_SISWA, ["Nama", "NISN", "Kelas"]);
  var data = sheet.getDataRange().getValues();
  var students = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][1]) {
      students.push({
        id: "std-" + i,
        name: String(data[i][0]).trim(),
        nisn: String(data[i][1]).trim(),
        className: String(data[i][2]).trim()
      });
    }
  }
  return { success: true, data: students };
}

// 7. Tambah Siswa Baru
function addStudentData(student) {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, CONFIG.SHEET_SISWA, ["Nama", "NISN", "Kelas"]);
  sheet.appendRow(["'" + student.name, "'" + student.nisn, "'" + student.className]);
  return { success: true };
}

// 8. Perbarui Siswa
function updateStudentData(student) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_SISWA);
  if (!sheet) return { success: false, error: "Sheet tidak ditemukan" };
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() === String(student.nisn).trim()) {
      sheet.getRange(i + 1, 1).setValue("'" + student.name);
      sheet.getRange(i + 1, 3).setValue("'" + student.className);
      return { success: true };
    }
  }
  return { success: false, error: "Siswa tidak ditemukan" };
}

// 9. Hapus Siswa
function deleteStudentData(nisn) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_SISWA);
  if (!sheet) return { success: false, error: "Sheet tidak ditemukan" };
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() === String(nisn).trim()) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: "Siswa tidak ditemukan" };
}

// 10. Impor Banyak Siswa
function importStudentsData(students) {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, CONFIG.SHEET_SISWA, ["Nama", "NISN", "Kelas"]);
  var rows = [];
  for (var i = 0; i < students.length; i++) {
    rows.push(["'" + students[i].name, "'" + students[i].nisn, "'" + students[i].className]);
  }
  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 3).setValues(rows);
  }
  return { success: true };
}

// 11. Unggah File ke Folder Google Drive
function uploadFileToDrive(fileName, mimeType, base64Data) {
  try {
    var folder;
    if (CONFIG.DRIVE_FOLDER_ID && CONFIG.DRIVE_FOLDER_ID !== "GANTI_DENGAN_DRIVE_FOLDER_ID_ANDA") {
      folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    } else {
      folder = DriveApp.getRootFolder();
    }

    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decoded, mimeType, fileName);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return {
      success: true,
      fileId: file.getId(),
      fileName: file.getName(),
      url: file.getUrl()
    };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// 12. Hapus File dari Google Drive
function deleteFileFromDrive(fileId) {
  try {
    var file = DriveApp.getFileById(fileId);
    file.setTrashed(true);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}
`;
