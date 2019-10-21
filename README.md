# Project 2: Flack Chat App

CS50x: Web Programming with Python and JavaScript

This project showcases a Slack-like chat website primarily using Flask and Javascript.

<b>Features include:</b>
 - Name input
 - Create and updates channels and messages via Web Sockets (SocketIO)
 - Javascript fetching data from Flask via AJAX requests
 - Last active channel and user name stored via localStorage
 - Deleting messages with animation via Keyframes
 - Messages load 20 at a time, with infinite scrolling
 - Browser back button and url updating functionality via HTML5 History API
 - Buttons enabled/disabled based on typing activity in input elements

<b>File Descriptions:</b>

/project_root:
 - requirements.txt >>> List of Python libraries
 - application.py >>> Flask Application

/templates:
 - base.html >>> Headers and Structure for all HTML
 - index.html >>> Main chat functionality
 - name.html >>> Input name

/static/css:
 - style.scss >>> SCSS script for my custom CSS
 - style.css >>> compiled stylesheet from SASS

/static/js:
 - index.js >>> JavaScript for chat functions
 - name.js >>> Javascript for name input
