// import { find, findOneAndDelete } from "../models/User.js";

// export async function getAllUsers(req, res) {
//   try {
//     const users = await find();
//     res.status(200).json(users);
//   } catch (error) {
//     res.status(500).json({ error: "Error fetching users" });
//   }
// }

// export async function deleteUser(req, res) {
//   const { uid } = req.params;

//   try {
//     await findOneAndDelete({ uid });
//     res.status(200).json({ message: "User deleted" });
//   } catch (error) {
//     res.status(500).json({ error: "Error deleting user" });
//   }
// }
