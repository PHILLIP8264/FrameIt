"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.db = exports.auth = void 0;
// Import the functions you need from the SDKs you need
var app_1 = require("firebase/app");
var auth_1 = require("firebase/auth");
var firestore_1 = require("firebase/firestore");
var storage_1 = require("firebase/storage");

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
  apiKey: "AIzaSyA-wmT4AhZMPYrNIu1G69XUi_dW3xokuXI",
  authDomain: "fameit-ee617.firebaseapp.com",
  projectId: "fameit-ee617",
  storageBucket: "fameit-ee617.firebasestorage.app",
  messagingSenderId: "635352633359",
  appId: "1:635352633359:web:e8c3cef76d09371464137a",
  measurementId: "G-5551QMFE82",
};
// Initialize Firebase
var app = (0, app_1.initializeApp)(firebaseConfig);
// Initialize Firebase services
exports.auth = (0, auth_1.getAuth)(app);
exports.db = (0, firestore_1.getFirestore)(app);
exports.storage = (0, storage_1.getStorage)(app);
exports.default = app;
