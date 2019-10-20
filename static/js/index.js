if (!localStorage.getItem('name'))
    window.location.href = '/name'
else
    var current_name = localStorage['name']

if (!localStorage.getItem('channel'))
    document.querySelector('#messageText').disabled = true
else {
    var current_channel = localStorage['channel']
}
// Start with first post.
let counter = 1

// Load posts 20 at a time.
const quantity = 20

document.addEventListener('DOMContentLoaded', () => {

    load()

    document.querySelector('#name').innerHTML = current_name

    // By default, submit buttons are disabled
    document.querySelectorAll('button').forEach( button => {
      button.disabled = true
    })

    document.querySelectorAll('input').forEach( input => {
      input.onkeyup = () => {
        if (input.value.length > 0)
            input.nextElementSibling.getElementsByTagName('button')[0].disabled = false;
        else
            input.nextElementSibling.getElementsByTagName('button')[0].disabled = true;
      }
    })

    // Web Sockets
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port)

    socket.on('connect', () => {
      // Create Channel
      document.querySelector('#channelForm').onsubmit = function() {
          let channelName = document.querySelector('#channelName').value
          socket.emit('create channel', {'channel': channelName})
          clear_form(this)
          switch_channelName(channelName)
          document.querySelector('#messageText').disabled = false
          return false
      };

      // Send Message
      document.querySelector('#messageForm').onsubmit = function() {
          let text = document.querySelector('#messageText').value
          socket.emit('send message',
              {'text': text, 'channel': current_channel, 'name': current_name})
          clear_form(this)
          return false
      }
    })

    socket.on('announce channel', data => {
      add_channel(data.channel)
    })

    socket.on('announce message', data => {
      if (data.channel === current_channel){
        if (document.querySelectorAll('.message').length >= 100)
            del_message()
        add_message(data)
      }
    })

    socket.on('announce remove', data => {
        if (data.channel === current_channel){
            const message = document.getElementById(data.id)
            message.remove()
        }
    })
})

window.onpopstate = e => {
    const data = e.state;
    switch_channelName(data.channel);
    load(channelList=true,channelMessages=true,popped=true);
};


// FUNCTIONS - - - - - - - - - - - - - - - - -

// Clear Form After Submit
function clear_form(form) {
    form.getElementsByTagName('input')[0].value = ""
    form.getElementsByTagName('button')[0].disabled = true
    document.querySelector('#messageText').focus()
}

// Add Message to Message Thread
function add_message(content) {
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port)

    // Create message block
    const message = document.createElement('div')
    message.className = 'message p-2 px-4'
    message.setAttribute('id', content.id)

    // 1 -- Main message body
    const main = document.createElement('h6');
    main.className = 'm-0';
    // 1.a -- Name
    const name = document.createElement('span')
    name.className = 'name'
    name.innerHTML = content.name.bold()
    // 1.b -- Text
    const text = document.createElement('span')
    text.className = 'text'
    text.innerHTML = content.text
    // Assemble main message body
    main.append(name, ': ', text)

    // 2 -- Message small text
    const small = document.createElement('small')
    // 2.a -- Timestamp
    const time = content.timestamp
    // 2.b -- Delete option
    const del = document.createElement('a')
    if (current_name === content.name) {
        del.href = ""
        del.className = "delete"
        del.innerHTML = 'Delete'
        del.onclick = () => {
            const message = del.parentElement.parentElement
            const id = message.getAttribute('id')
            socket.emit('remove message', {'id': id, 'channel': current_channel})
            return false
        }
    }
    // Assemble message small text
    small.append(time, ' | ', del)

    // Assemble message block
    message.append(main, small)

    // Update message thread
    const messages_div = document.querySelector('#messages')
    messages_div.append(message)
    scroll_to_bottom(messages_div)
};

// Clear Current View of Message Thread
function clear_messages() {
    document.querySelector('#messages').innerHTML = '<hr>'
}

function clear_channels() {
    document.querySelector('#channels').innerHTML = '<hr>'
}

// Auto Scroll to Bottom of Thread
function scroll_to_bottom (div) {
    div.scrollTop = div.scrollHeight
}

// Keep Messages Under 100
function del_message() {
    if (document.querySelector('.message'))
        document.querySelector('.message').remove()
}

// Add Channel to Channel List
function add_channel(channelName) {
    const channel = document.createElement('div')
    channel.className = 'channel px-4'
    channel.innerHTML = channelName

    // Switching between channels
    channel.onclick = () => {
        if (channelName !== current_channel) {
            switch_channelName(channelName)
            switch_channel(channel)
        }
    }

    // Set active channel on first load or new channel
    if (channelName === current_channel)
        switch_channel(channel)

    // Update channel list
    channels_div = document.querySelector('#channels');
    channels_div.append(channel);
    scroll_to_bottom(channels_div);
}

// Switch Current Channel Name
function switch_channelName(channelName) {
    localStorage.setItem('channel',channelName)
    current_channel = channelName
}

// Switch Active Channel
function switch_channel(channel) {
    // Remove class label from previous channel
    old_channel = document.querySelector('.active-channel')
    if (old_channel)
        old_channel.classList.remove("active-channel")
    // Add class label to new channel
    channel.classList.add("active-channel")
    // Load channel
    clear_messages()
    document.querySelector('#channel').innerHTML = current_channel.bold()
    load(channelList=false,channelMessages=true)
}

// Load Data Onto Page
function load(channelList=true, channelMessages=true, popped=false) {

  // Set start and end post numbers, and update counter.
  // const start = counter;
  // const end = start + quantity - 1;
  // counter = end + 1;

  // Open new request to get more messages
  const request = new XMLHttpRequest();
  request.open('POST', '/message_data');
  request.onload = () => {
      const data = JSON.parse(request.responseText)

      // Load Channels
      if (channelList) {
          clear_channels()
          let channels = data.channel_list
          channels.forEach(add_channel)
      }

      // Load Messages
      if (channelMessages) {
          clear_messages()
          let messages = data.channel_messages
          if (messages)
              messages.forEach(add_message)
      }

      // Will not run on back button
      if (!popped) {
          title = 'Project2: Flask | ' + current_channel
          document.title = title
          history.pushState({'channel': current_channel}, current_channel, current_channel)
      }
  }

  // Add start and end points to request data
  const data = new FormData()
  data.append('channel', current_channel)
  // data.append('start', start)
  // data.append('end', end)

  // Send request
  request.send(data)
}
