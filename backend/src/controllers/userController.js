import User from "../models/User.js";

export const updateProfile = async (req, res) => {
  try {
     const updated = await User.findByIdAndUpdate(
  req.user.id,
  req.body,
  { returnDocument: "after" }
);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Profile update failed" });
  }
};

 export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "age gender height weight activity goal dietType"
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};
