

const socket = io()
var form = document.getElementById('form')
var input = document.getElementById('input')
const userList = document.getElementById('userList')
const messages = document.getElementById('messages')


function renderActiveUserList(data) {
    let rawHTML = ''
    data.forEach(user => {
      rawHTML += `
<div class="list-group rounded-0">
  <a class="list-group-item list-group-item-action rounded-0 p-1"
    style="border:none; border-bottom: 1px solid #E6ECF0">
    <div class="media">
      <img class="m-1" src=${user.currentUserAvatar}
        style="background: #C4C4C4;border-radius: 100%; width: 50px; height: 50px">
      <div class="media-body ml-2 align-self-center">
        <div class="mb-1">
          <span class="user-name" style="color:black">${user.currentUserName}</span>
          <span class="user-account">@${user.currentUserAccount}</span><br>
        </div>
      </div>
    </div>
  </a>
</div>
` }) 
userList.innerHTML = rawHTML
}


form.addEventListener('submit', function (e) {
  let msg = input.value
  e.preventDefault()
  send (msg)
})
function send () {
  let msg = input.value
  socket.emit('chat message', msg)
  renderMessage(msg)
  document.querySelector('#input').value = ''
}
function renderMessage (msg){
  messages.innerHTML += `
    <div style="text-align: right">
      <div class="bg-light rounded py-2 px-3 mb-3" style="width:auto !important; display:inline-block">
        <p class=" text-small mb-0 text-muted">${msg}</p>
      </div>
    </div>
  `
}  


socket.on('chat message self', function (msg) {
  var item = document.createElement('li')
  item.textContent = msg;
  messages.appendChild(item)
  window.scrollTo(0, document.body.scrollHeight)
})
socket.on('chat message info',(data) => {
  messages.innerHTML += `
    <div style="text-align: center">
      <div class="bg-light rounded py-2 px-3 mb-3" style="width:auto !important; display:inline-block">
        <p class=" text-small mb-0 text-muted">${data}</p>
      </div>
    </div>
  `
})

socket.on('active-users', (data) => { renderActiveUserList(data) })
socket.on('chat message', (data) => {
  messages.innerHTML += `
        <div class="media w-50 mb-3">
          <img src="${user.currentUserAvatar}" alt="user"
            width="50" class="rounded-circle">
          <div class="media-body ml-3">
            <div class="bg-light rounded py-2 px-3 mb-2">
              <p class="text-small mb-0 text-muted">${user.currentUserAvatar.text}</p>
            </div>
            <p class="small text-muted">${data.time}</p>
          </div>
        </div>
      `
  scrollWindow()
})