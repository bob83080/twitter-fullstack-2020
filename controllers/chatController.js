const chatController = {
  getChat: (req, res) => {
    res.render('chat')
  },
  getChatRoom: (req, res) => {
    res.render('chatroom')
  }
}

module.exports = chatController