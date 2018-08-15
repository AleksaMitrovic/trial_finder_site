'use strict';

// Shortcuts to DOM Elements.
var messageForm = document.getElementById('message-form');
var messageInput = document.getElementById('new-post-message');
var titleInput = document.getElementById('new-post-title');
var signInButton = document.getElementById('sign-in-button');
var forgotPasswordButton = document.getElementById('forgot-password-button');

var signOutButton = document.getElementById('sign-out-button');
var splashPage = document.getElementById('page-splash');
var addPost = document.getElementById('add-post');
var addButton = document.getElementById('add');
var recentPostsSection = document.getElementById('recent-posts-list');
var userPostsSection = document.getElementById('user-posts-list');
var topUserPostsSection = document.getElementById('top-user-posts-list');
var topUserPostsSectionleft = document.getElementById('top-user-posts-listleft');
var clt = document.getElementById('clt');
var sendbutton = document.getElementById('sendbutton');
var sendmessage = document.getElementById('message');
var usr = document.getElementById('usr');
var pwd = document.getElementById('pwd');
var cltlink = document.getElementById('cltlink');
var applink = document.getElementById('applink');
var application = document.getElementById('application');
var header = document.getElementById('header');
var so = document.getElementById('so');
var nbrand = document.getElementById('nbrand');
var fcmToken;


var sitename ="";
var isLoad = true;
nbrand.innerHTML=sitename;
var namer= '';
var user_email = '';
//var recentMenuButton = document.getElementById('menu-recent');
//var myPostsMenuButton = document.getElementById('menu-my-posts');
var myTopPostsMenuButton = document.getElementById('menu-my-top-posts');
var listeningFirebaseRefs = [];

/**
 * Saves a new post to the Firebase DB.
 */
// [START write_fan_out]
function writeNewPost(uid, username, picture, title, body) {
  // A post entry.
  var postData = {
    author: username,
    uid: uid,
    body: body,
    title: title,
    starCount: 0,
    authorPic: picture
  };
  // Get a key for a new Post.
  var newPostKey = firebase.database().ref().child('posts').push().key;
  // Write the new post's data simultaneously in the posts list and the user's post list.
  var updates = {};
  updates['/posts/' + newPostKey] = postData;
  updates['/user-posts/' + uid + '/' + newPostKey] = postData;
  return firebase.database().ref().update(updates);
}
// [END write_fan_out]

/**
 * Star/unstar post.
 */
// [START post_stars_transaction]
function toggleStar(postRef, uid) {
  postRef.transaction(function(post) {
    if (post) {
      if (post.stars && post.stars[uid]) {
        post.starCount--;
        post.stars[uid] = null;
      } else {
        post.starCount++;
        if (!post.stars) {
          post.stars = {};
        }
        post.stars[uid] = true;
      }
    }
    return post;
  });
}
// [END post_stars_transaction]
cltlink.onclick =function(){
  showSection(clt,cltlink);
}

var konu='';

$('#send-message-form').submit(function(e){
  e.preventDefault();
  
  if(user_email && sendmessage.value)
  {
    $.ajax({
      url: "https://formspree.io/" + user_email,
      method: "POST",
      data: $(this).serialize() + '(from ' + sitename + ')',
      dataType: "json"
    });
  }
  
  var ref = firebase.database().ref('messages/'+sitename+'/'+namer+'/number');
  ref.transaction(function(currentClicks) {
    // If node/clicks has never been set, currentRank will be `null`.
    var newValue = (currentClicks || 0) + 1;
    
    var d = new Date();
    var n = d.toISOString();
    var dt = new Date("2013-08-15T17:00:00Z");
    var s = dt.toISOString();  
    if(konu!=''){

        firebase.database().ref('messages/'+sitename+'/'+namer+'/'+konu).push({
          text: sendmessage.value,
          senderName:sitename ,
          senderId: '12',
          timeStamp:n,
          number:newValue
         // uid: ''
        });

        console.log('Send notification to user: ' + namer + " site name: " + sitename + " store: " + konu );

        sendMessageFcmToUser(window.fcmToken, sendmessage.value,namer,sitename, konu);
        console.log("Konu:" + konu);
        sendmessage.value='';
        var scrollElement = document.getElementById('posts-container-main');
        scrollElement.scrollTop = scrollElement.scrollHeight;
    }
    return newValue;
  }); 

})
function sendMessageFcmToUser(tokenId, message,user, site, store)
{
   $.ajax(
   {
       type : "POST",
       url : "https://fcm.googleapis.com/fcm/send",

       headers :
       {
           Authorization : "key=AAAAnhFSH3k:APA91bEJx6NI7KW5T3XMrdaiEuFN_G227lWgHBQdo36rCDDFtAL1Q7jivpHyZsaNQn7a7ZOGdfaHqHRiaIp6fMdzNllN9-6eQOsyMz151D4AedkmLy-Kq9WhUCusIFB8JVQFUD8rvBJZ9HJ7EatELryN_iBqyie0jg"
       },

       contentType : 'application/json',
       data : JSON.stringify(
       {
           "to" : tokenId,
           "notification":
           {
               "body" : message,
               "user_id" : user,
               "web_site" : site,
               "web_store" : store,
               "title": "Trial Finder",
               "sound": "default",
               "click_action": "ACTION_CLICK_NOTIFY",
                "badge": "1"

           }
       }),

       success : function(response)
       {
           console.log(response);
       },
       error : function(xhr, status, error)
       {
           console.log(xhr);
       }
   });
}


function sendMessageToUser(deviceId, message) {
  request({
    url: 'https://fcm.googleapis.com/fcm/send',
    method: 'POST',
    headers: {
      'Content-Type' :' application/json',
      'Authorization': 'key=AI...8o'
    },
    body: JSON.stringify(
      { "data": {
        "message": message
      },
        "to" : deviceId
      }
    )
  }, function(error, response, body) {
    if (error) { 
      console.error(error, response, body); 
    }
    else if (response.statusCode >= 400) { 
      console.error('HTTP Error: '+response.statusCode+' - '+response.statusMessage+'\n'+body); 
    }
    else {
      console.log('Done!')
    }
  });
}

/**
 * Creates a post element.
 */
 
function createheaders(trialname,sender,isim,msg) {
  var uid = firebase.auth().currentUser.uid;
  console.log("trialname,sender,isim,msg:" +  trialname + " " + sender + " " + isim + " " + msg);
	var html =
      '<div class="post mdl-grid mdl-js-ripple-effect" style="background:#fdfdfd;border-bottom:1px solid #ededed;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items: center;"> '
	  +'<div class="avatar" style=""></div>'
	  +'<div class="u_info">'
	  +'<div class="u_isim"><p>'+isim+'</p></div>'
	  +'<div class="u_sender"><p>'+sender+'</p></div>'
	  +'<div id="u_msg"><p>'+msg.substring(0, 12)+'</p></div>'
      +'</div></div>';
	//Create the DOM element from the HTML.
	var div = document.createElement('div');
	div.innerHTML = html;
	var postElement = div.firstChild;
	postElement.getElementsByClassName('avatar')[0].style.backgroundImage = 'url("' + ( './silhouette.jpg') + '")';

	postElement.onclick = function() {

		konu= sender;
		var elements = document.getElementsByClassName('post');
		for (var i = 0; i < elements.length; i++) {
			elements[i].style.backgroundColor="#fff";
			elements[i].style.fontWeight="";

		}

		this.style.fontWeight ="900"
		if(this.style.backgroundColor="#e7ebec"){

		}else{

		}
		// [START my_top_posts_query]
		var myUserId = firebase.auth().currentUser.uid;
		console.log("Sender click right " + trialname);

    var refGetUserFcmToken = firebase.database().ref('fcmToken/'+trialname);
    refGetUserFcmToken.once('value').then(function(snapshot) {
      console.log('user fcm token for ky ' + snapshot.val() );
      window.fcmToken = snapshot.val();
    })

		var topUserPostsRef = firebase.database().ref('messages/'+sitename+'/'+trialname+'/'+sender);
		topUserPostsRef.off("child_added");
		namer=trialname;
		var addPostsleft = function(postsRef, sectionElement) {
			postsRef.orderByChild("number").on('child_added', function(data) {
        console.log(data.val())
  			var author = data.val().senderName;
  			var containerElement = sectionElement.getElementsByClassName('posts-container')[0];  
  			// var u_msg = document.getElementById("u_msg");
  			// u_msg.innerHTML = '<p>'+data.val().text+'</p>';
        containerElement.appendChild(createPostElement(data.key, data.val().timeStamp, data.val().text, data.val().senderName, data.val().SenderId, data.val().timeStamp));
			});
		};
		topUserPostsSectionleft.getElementsByClassName('posts-container')[0].innerHTML="";
		addPostsleft(topUserPostsRef, topUserPostsSectionleft);
		console.log("mesage load start to right panel");
	};
  return postElement;
}


/**
 * Creates a post element.
 */
function createTrialElement(studyName,sites,details,datePosted,conditionIcon,index){
  var iconName = conditionIcon.split('/');
  var storageRef = firebase.storage().ref();
 
  var element = storageRef.child(iconName[3] + '/' + iconName[4])
  .getDownloadURL()
  .then(function(url){
    var html=
    '<div class="card">' +
      '<div class="card-face face-1"><!-- Menu trigger -->' +  
        '<div class="card-face__avatar"><!-- Bullet notification --><!-- User avatar --><img src="'+ url + '" width="110" height="110" draggable="false"/></div><!-- Name -->' + 
        '<h4 class="card-face__name">'+ studyName + '</h4><span class="card-face__title">' + sites + '</span>' +
        '<button class="btn btn-primary detail-view" data-id="123" data-image = "' + url + '" data-studyname="' + studyName + '" data-sites="' + sites + '" data-details="' + details + '" data-dateposted="' + datePosted + '" data-toggle="modal" data-target="#data-gallery' + index + '" style = "background-color:#2e72b7;border-color:#2e72b7; margin-top:auto;margin-bottom:50px;">Details...</button>' + 
      '</div>' +
      '<div class="modal fade" id="data-gallery' + index + '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' + 
        '<div class="modal-dialog modal-lg">' + 
            '<div class="modal-content">' + 
                '<div class="modal-header">' + 
                    '<h4 class="modal-title" id="data-gallery-title">' + studyName + '</h4>' + 
                    '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span><span class="sr-only">Close</span>' + 
                    '</button>' +
                '</div>' + 
                '<div class="modal-body" style = "display:flex;">' +
                  '<div class = "img-container" style="display:flex;flex-direction:column;flex:1;align-items:center;margin-right:30px;">' + 
                    '<img id="data-gallery-image" src="'+ url + '" style="width:150px; height:150px;">' +
                    '<h6 style="text-align:center;font-size:19px;">'+ studyName + 
                  '</div>' + 
                  '<div class = "body-container" style="display:flex;flex-direction:column;flex:3;">' + 
                    '<h5>Detail</h5>' + 
                    '<p>' + details + '</p>' + 
                  '</div>' + 
                '</div>' +
                '<div class="modal-footer">' + 
                '</div>' + 
            '</div>' + 
        '</div>' +  
      '</div>' + 
    '</div>';
    var div = document.createElement('div');
    div.innerHTML = html;
    var trialElement = div.firstChild;
    return trialElement;
  });
  return element; 
}
function createPostElement(postId, title, text, author, authorId, authorPic) {
  var uid = firebase.auth().currentUser.uid;
  var maks;
  if(text.length<20){
    maks=20;
  }else{
    maks=55;
  }
  if(author==sitename){
    var html =
    "<div class=' mdl-grid ' style='padding-left:14px;float:right;clear:both; word-wrap:break-word; width:"+maks+"%; position: relative;-webkit-transform: scaleY(1); transform: scaleY(1);'>" +
      "<div class='text talk-bubble  tri-right right-top mdl-color-text--black' style='background: #a9cce3;clear: both;word-wrap: break-word;width:100% '></div>" +
    "</div>";  
    
  }
  else{
    user_email = author;
    var html =
    "<div class='mdl-grid' style='padding-left:14px;float:left;clear: both; word-wrap: break-word;width:55% ;position: relative;-webkit-transform: scaleY(1); transform: scaleY(1);'>" +
      "<div class='avatar'></div>" +
      "<div class='text talk-bubble  tri-right left-top mdl-color-text--black' style='clear: both;word-wrap: break-word;width:70%'></div>" +
    "</div>";
  }
  // Create the DOM element from the HTML.
  var div = document.createElement('div');
  div.innerHTML = html;
  var postElement = div.firstChild;
  if (componentHandler) {
  }
  // Set values.
  postElement.getElementsByClassName('text')[0].innerText = text;
  return postElement;
}

/**
 * Writes a new comment for the given post.
 */
function createNewComment(postId, username, uid, text) {
  firebase.database().ref('post-comments/' + postId).push({
    text: text,
    author: username,
    uid: uid
  });
}

/**
 * Updates the starred status of the post.
 */
function updateStarredByCurrentUser(postElement, starred) {
  if (starred) {
    postElement.getElementsByClassName('starred')[0].style.display = 'inline-block';
    postElement.getElementsByClassName('not-starred')[0].style.display = 'none';
  } else {
    postElement.getElementsByClassName('starred')[0].style.display = 'none';
    postElement.getElementsByClassName('not-starred')[0].style.display = 'inline-block';
  }
}

/**
 * Updates the number of stars displayed for a post.
 */
function updateStarCount(postElement, nbStart) {
  postElement.getElementsByClassName('star-count')[0].innerText = nbStart;
}

/**
 * Creates a comment element and adds it to the given postElement.
 */
function addCommentElement(postElement, id, text, author) {
  var comment = document.createElement('div');
  comment.classList.add('comment-' + id);
  comment.innerHTML = '<span class="username"></span><span class="comment"></span>';
  comment.getElementsByClassName('comment')[0].innerText = text;
  comment.getElementsByClassName('username')[0].innerText = author ;

  var commentsContainer = postElement.getElementsByClassName('comments-container')[0];
  commentsContainer.appendChild(comment);

}

/**
 * Sets the comment's values in the given postElement.
 */
function setCommentValues(postElement, id, text, author) {
  var comment = postElement.getElementsByClassName('comment-' + id)[0];
  comment.getElementsByClassName('comment')[0].innerText = text;
  comment.getElementsByClassName('fp-username')[0].innerText = author;
}

/**
 * Deletes the comment of the given ID in the given postElement.
 */
function deleteComment(postElement, id) {
  var comment = postElement.getElementsByClassName('comment-' + id)[0];
  comment.parentElement.removeChild(comment);
}

/**
 * Starts listening for new posts and populates posts lists.
 */
var fruits = [];var uniq = [];
function startDatabaseQueries() {
  // [START my_top_posts_query]
  var myUserId = firebase.auth().currentUser.uid;
  console.log('myUserId ' + firebase.auth().currentUser.uid);
  firebase.database().ref('/users/' + myUserId).once('value').then(function(snapshot) {
    var userData = snapshot.val();
    if (userData == null ||   userData.siteName == null || userData.siteName == '' ){
      console.log('userData.siteName: ' + userData.siteName);
      alert ("You are not site admin, logout now");
      firebase.auth().signOut();
    }
    console.log("userData.siteName " + userData.siteName);
    sitename=userData.siteName; 
    nbrand.innerHTML=sitename;
    //function createPostElement(postId, title, text, author, authorId, authorPic) {

    var topUserPostsRef = firebase.database().ref('messages/'+sitename);
    var trialsRef = firebase.database().ref('trials');
    // [END my_top_posts_query]
    // [START recent_posts_query]
    var recentPostsRef = firebase.database().ref('posts').limitToLast(100);
    // [END recent_posts_query]
    var userPostsRef = firebase.database().ref('user-posts/' + myUserId);
  

    ////////////////////////////////////////////////////////////////////////////////////
    var fruits = [];var uniq = [];
    var run=0;
    if(isLoad == true){
      var fetchPostsleft = function(postsRef, sectionElement,fruits,uniq) {
        postsRef.orderByChild('number').on('child_added', function(data) {
          var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
          //containerElement.insertBefore(createPostElement(data.key, data.key, data.val().text, data.val().senderName, data.val().SenderId, data.val().timeStamp),containerElement.firstChild);
          var containerElement2 = sectionElement.getElementsByClassName('posts-containerleft')[0];
          // containerElement2.insertBefore( createPostElement(data.key, data.key, data.val().text, data.val().senderName, data.val().SenderId, data.val().timeStamp),containerElement2.firstChild);
          if(!fruits.includes(data.key)){
            fruits.push(data.key);  
            var ky=data.key;

            firebase.database().ref('users/').on('child_added', function(datacc) {
              if(datacc.key==ky){

                firebase.database().ref('messages/'+sitename+'/'+ky).orderByChild("number").on('child_added', function(datax) {

                  var lm='';
                  firebase.database().ref('messages/'+sitename+'/'+ky+'/'+datax.key).on('child_added', function(dataxc) {
                    lm=dataxc.val().text;
                  });
                  var firstName = datacc.val().firstName;
                  var lastName = datacc.val().lastName;
                  if (firstName == null){
                      firstName = "";
                  }
                  if (lastName == null){
                      lastName = "";
                  }
                  if(datax.key != 'number' && datax.key != 'fcmToken'){
                      containerElement2.insertBefore( createheaders(data.key, datax.key, firstName+' '+ lastName,lm),containerElement2.firstChild);
                  }
                });
              }
            });
          }
        });
      };
      var fetchTrials = function(trialsRef,sectionElement){
        var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
        var index = 0;
        trialsRef.on('child_added', function(data) {
          var promise = createTrialElement(data.val().studyName,data.val().sites,data.val().details,data.val().datePosted,data.val().conditionIcon, index++);
          promise.then(function(result){
            containerElement.insertBefore(result,containerElement.firstChild);
          })
        });
      }
    };

		isLoad = false;
    fetchPostsleft(topUserPostsRef, topUserPostsSectionleft,fruits,uniq);
    fetchTrials(trialsRef,clt);
    listeningFirebaseRefs.push(topUserPostsRef); 
  });

}

/**
 * Writes the user's data to the database.
 */
// [START basic_write]
function writeUserData(userId, name, email, imageUrl) {
  firebase.database().ref('users/' + userId).set({
	  uid:userId,
    username: name,
    email: email,
    profile_picture : imageUrl,
	firebaseid: ''
  });
}
// [END basic_write]

/**
 * Cleanups the UI and removes all Firebase listeners.
 */
function cleanupUi() {
  // Remove all previously displayed posts.
  topUserPostsSection.getElementsByClassName('posts-container')[0].innerHTML = '';
  recentPostsSection.getElementsByClassName('posts-container')[0].innerHTML = '';
  userPostsSection.getElementsByClassName('posts-container')[0].innerHTML = '';

  // Stop all currently listening Firebase listeners.
  listeningFirebaseRefs.forEach(function(ref) {
    ref.off();
  });
  listeningFirebaseRefs = [];
}

/**
 * The ID of the currently signed-in User. We keep track of this to detect Auth state change events that are just
 * programmatic token refresh but not a User status change.
 */
var currentUID;

/**
 * Triggers every time there is a change in the Firebase auth state (i.e. user signed-in or user signed out).
 */
function onAuthStateChanged(user) {
  // We ignore token refresh events.
  if (user && currentUID === user.uid) {
    return;
  }

  cleanupUi();
  if (user) {
    currentUID = user.uid;
    splashPage.style.display = 'none';
    
//if(user.email=="xllllll@yandex.com"){sitename="Merck Clinical Trials";}else{sitename="AGA Clinical Trials"; }
    startDatabaseQueries();
  } else {
    // Set currentUID to null.
    currentUID = null;
    // Display the splash page where you can sign-in.
    splashPage.style.display = '';
  }
}

/**
 * Creates a new post for the current user.
 */
function newPostForCurrentUser(title, text) {
  // [START single_value_read]
  var userId = firebase.auth().currentUser.uid;
  return firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
    var username = snapshot.val().username;
    // [START_EXCLUDE]
    return writeNewPost(firebase.auth().currentUser.uid, username,
        firebase.auth().currentUser.photoURL,
        title, text);
    // [END_EXCLUDE]
  });
  // [END single_value_read]
}

/**
 * Displays the given section element and changes styling of the given button.
 */
function showSection(sectionElement, buttonElement) {
  recentPostsSection.style.display = 'none';
  userPostsSection.style.display = 'none';
  topUserPostsSection.style.display = 'none';
  topUserPostsSectionleft.style.display = 'none';
  addPost.style.display = 'none';
  clt.style.display = 'none';
  $('.nav-link').removeClass('is-active');
  if (sectionElement) {
    sectionElement.style.display = 'block';
  }
  if (buttonElement) {
    buttonElement.classList.add('is-active');
  }
}

// Bindings on load.
window.addEventListener('load', function() {
  // Bind Sign in button.
  /*==================================================================
  [ Validate ]*/

  var input = $('.validate-input .input100');
  $('.validate-form .input100').each(function(){
    $(this).focus(function(){
        hideValidate(this);
    });
  });
  $('#sign-in-button').on('click',function(){
      var check = true;
      for(var i=0; i<input.length; i++) {
          if(validate(input[i]) == false){
              showValidate(input[i]);
              check=false;
          }
      }
      if(check){
        firebase.auth().signInWithEmailAndPassword(usr.value, pwd.value)
        .catch(function(error) {
        // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          if (errorCode === 'auth/wrong-password') {
            swalAlert('Password or email is wrong, please check again','error');
          } else {
            alert(errorMessage);
          }
          console.log(error);
          }
        );
      } 
  });
  function swalAlert(message,result){
    swal("", message, result);  
  }
  $('#forgot-password-button').on('click',function(){
    if(usr.value==''){
      swalAlert('please input your email to reset password!','error');
    } else {
      if(validate(usr) == false)
        showValidate(usr);
      else{
        firebase.auth().sendPasswordResetEmail(usr.value).then(function() {
          swalAlert('A email was sent to your email inbox, please check to reset password','success');
        });
      }
    }
  });

  function validate (input) {
      if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
          if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
              return false;
          }
      }
      else {
          if($(input).val().trim() == ''){
              return false;
          }
      }
  }

  function showValidate(input) {
      var thisAlert = $(input).parent();
      $(thisAlert).addClass('alert-validate');
  }

  function hideValidate(input) {
      var thisAlert = $(input).parent();
      $(thisAlert).removeClass('alert-validate');
  }
  
  applink.addEventListener('click',function(){
    
    splashPage.style.display='none';
    topUserPostsSectionleft.style.display= 'none';
    topUserPostsSection.style.display= 'none';
    header.style.display='none';
    recentPostsSection.style.display = 'none';
    userPostsSection.style.display = 'none';
    topUserPostsSection.style.display = 'none';
    addPost.style.display = 'none';
    
    application.style.display='visible';
    
  });
  // Bind Sign out button.
  so.addEventListener('click', function() {
	  
    swal({
      text:"SESSION WILL BE CLOSED! ARE YOU SURE?",
      icon:"warning",
      buttons:true,
      dangerMode:true,
    })
    .then((willAgree) => {
      if(willAgree){
        firebase.auth().signOut();
      }
    })
  });

  // Listen for auth state changes
  firebase.auth().onAuthStateChanged(onAuthStateChanged);
  
  // Saves message on form submit.
  messageForm.onsubmit = function(e) {
    e.preventDefault();
    var text = messageInput.value;
    var title = titleInput.value;
    if (text && title) {
      newPostForCurrentUser(title, text).then(function() {
        myPostsMenuButton.click();
      });
      messageInput.value = '';
      titleInput.value = '';
    }
  };

  // Bind menu buttons.
  //recentMenuButton.onclick = function() {
   // showSection(recentPostsSection, recentMenuButton);
  //};
  //myPostsMenuButton.onclick = function() {
   // showSection(userPostsSection, myPostsMenuButton);
  //};
  myTopPostsMenuButton.onclick = function() {
	    showSection(topUserPostsSectionleft, myTopPostsMenuButton);
  };
  //myTopPostsMenuButton.onclick();
  cltlink.click();
}, false);