const socket = io()
var form = document.getElementById('form')
var input = document.getElementById('input')
const userList = document.getElementById('userList')

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
      let msg =  input.value
      
      e.preventDefault()
      if (msg) {
        socket.emit('chat message', msg);
        input.value = ''
      }
    })
    

socket.on('chat message', function (msg) {
  var item = document.createElement('li')
  item.textContent = msg;
  messages.appendChild(item)
  window.scrollTo(0, document.body.scrollHeight)
})

socket.on('active-users', (data) => { renderActiveUserList(data) })
