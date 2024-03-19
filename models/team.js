const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");


const Schema = mongoose.Schema;

const teamSchema = new Schema({
  name: { type: String, required: true , unique: true},
  captain: { type: String, required: true , unique: true},
  // logo: { type: *****, required: true },
  description : { type: String, required:true, minlength:200 },
  members: [{ type: mongoose.Types.ObjectId, required: true ,ref:'User'}],
  joined_hackathon: [{  type: mongoose.Types.ObjectId, required: true}],
});

teamSchema.plugin(uniqueValidator);
module.exports =mongoose.model('Team',teamSchema);