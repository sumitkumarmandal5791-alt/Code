const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    id: {
        type: String
    },
    info: [{
        role: {
            type: String,
            enum: ["user", 'model'],

        },
        parts: [
            {
                text: {
                    type: String
                }
            }
        ]
    }

    ]

})

const ai = mongoose.model('CHAT', schema);
module.exports = ai