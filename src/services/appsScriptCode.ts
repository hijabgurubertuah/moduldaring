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
        result = getGradesByClassAndSubject(params.className, params.subject);
      } else if (action === "saveGrades") {
        result = saveGradesData(params.className, params.subject, params.records);
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

// 2. Ambil Nilai Khusus NISN Siswa
function getStudentGradesByNisn(nisn) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NILAI);
  if (!sheet) return { success: true, data: [] };

  var data = sheet.getDataRange().getValues();
  var grades = [];
  for (var i = 1; i < data.length; i++) {
    var rowNisn = String(data[i][0]).trim();
    if (rowNisn === String(nisn).trim()) {
      grades.push({
        studentNisn: rowNisn,
        studentName: String(data[i][1]).trim(),
        className: String(data[i][2]).trim(),
        subject: String(data[i][3]).trim(),
        tugas: Number(data[i][4]) || 0,
        kuis: Number(data[i][5]) || 0,
        uts: Number(data[i][6]) || 0,
        uas: Number(data[i][7]) || 0,
        nilaiAkhir: Number(data[i][8]) || 0,
        predikat: String(data[i][9]).trim(),
        updatedAt: String(data[i][10] || "")
      });
    }
  }
  return { success: true, data: grades };
}

// 3. Ambil Gambar Drive sebagai Base64
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

// 4. Ambil Seluruh Data Siswa (Staff)
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

// 5. Tambah Siswa Baru
function addStudentData(student) {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, CONFIG.SHEET_SISWA, ["Nama", "NISN", "Kelas"]);
  sheet.appendRow(["'" + student.name, "'" + student.nisn, "'" + student.className]);
  return { success: true };
}

// 6. Perbarui Siswa
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

// 7. Hapus Siswa
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

// 8. Impor Banyak Siswa
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

// 9. Ambil Nilai per Kelas dan Mapel
function getGradesByClassAndSubject(className, subject) {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, CONFIG.SHEET_NILAI, ["NISN", "Nama", "Kelas", "Mata Pelajaran", "Tugas", "Kuis", "UTS", "UAS", "Nilai Akhir", "Predikat", "Diperbarui"]);
  var data = sheet.getDataRange().getValues();
  var records = [];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][2]).trim() === String(className).trim() && String(data[i][3]).trim() === String(subject).trim()) {
      records.push({
        id: "grd-" + i,
        studentNisn: String(data[i][0]).trim(),
        studentName: String(data[i][1]).trim(),
        className: String(data[i][2]).trim(),
        subject: String(data[i][3]).trim(),
        tugas: Number(data[i][4]) || 0,
        kuis: Number(data[i][5]) || 0,
        uts: Number(data[i][6]) || 0,
        uas: Number(data[i][7]) || 0,
        nilaiAkhir: Number(data[i][8]) || 0,
        predikat: String(data[i][9]).trim(),
        updatedAt: String(data[i][10] || "")
      });
    }
  }
  return { success: true, data: records };
}

// 10. Simpan Rekap Nilai
function saveGradesData(className, subject, records) {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, CONFIG.SHEET_NILAI, ["NISN", "Nama", "Kelas", "Mata Pelajaran", "Tugas", "Kuis", "UTS", "UAS", "Nilai Akhir", "Predikat", "Diperbarui"]);
  var data = sheet.getDataRange().getValues();

  var map = {};
  for (var i = 1; i < data.length; i++) {
    var key = String(data[i][0]).trim() + "___" + String(data[i][3]).trim();
    map[key] = i + 1; // row number
  }

  var now = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm");

  for (var j = 0; j < records.length; j++) {
    var rec = records[j];
    var searchKey = String(rec.studentNisn).trim() + "___" + String(subject).trim();
    var rowData = [
      "'" + rec.studentNisn,
      "'" + rec.studentName,
      "'" + className,
      "'" + subject,
      rec.tugas,
      rec.kuis,
      rec.uts,
      rec.uas,
      rec.nilaiAkhir,
      rec.predikat,
      now
    ];

    if (map[searchKey]) {
      sheet.getRange(map[searchKey], 1, 1, 11).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }
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
