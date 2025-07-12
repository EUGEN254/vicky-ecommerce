// hashAdmin.js
import bcrypt from 'bcryptjs';

const hashPassword = async () => {
  const plainPassword = 'admin123';
  const hashed = await bcrypt.hash(plainPassword, 10);
  console.log('Hashed Password:', hashed);
};

hashPassword();


// INSERT INTO admin (name, email, password, role)
// VALUES ('Admin', 'admin@example.com', '$2b$10$2HuEJxcS9FgEL5B1qJpn4u9WJrSKUyKpCcFWkqz7hfBVLZmIX2ANm', 'admin');
// import { createAdmin } from './models/adminModel.js';
// import { v4 as uuidv4 } from 'uuid';

// // Your admin data (replace with actual values)
// const adminData = {
//   id: uuidv4(), // or use your existing ID format like "user_2unqyL4diJFP1E3pIBnasc7w8hP"
//   username: "Gracie",
//   email: "user.greatstack@gmail.com",
//   image: "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvdXBsb2FkZWQvaW1nXzJ2N2c5YVpSSEFVYVUxbmVYZ2JkSVVuWnFzWSJ9",
//   password: "your_secure_password_here" // Replace with actual password
// };

// // Execute the creation
// createAdmin(adminData)
// //   .then(() => console.log("Admin created successfully!"))
//   .catch(err => console.error("Error creating admin:", err));