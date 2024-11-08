import auth from '../config/firebase.js';
// import { findOne, create } from "../models/User.js";

// export async function loginWithFirebase(req, res) {
//   const { token } = req.body;

//   try {
//     const decodedToken = await auth().verifyIdToken(token);
//     const { uid, email, name } = decodedToken;
//     let user = await findOne({ uid });

//     if (!user) {
//       user = await create({ uid, email, name });
//     }

//     res.status(200).json({ message: "User authenticated", user });
//   } catch (error) {
//     res.status(401).json({ error: "Unauthorized" });
//   }
// }
