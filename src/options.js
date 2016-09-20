// Checks the given email and password are valid
// Feedbin credentials.
var verifyCredentials = function(email, password){
  var dfd = $.Deferred()
  var options = {
    url: 'https://api.feedbin.me/v2/subscriptions.json',
    username: email,
    password: password,
    dataType: 'json',
    contentType: 'application/json; charset=utf-8'
  }
  $.ajax(options).done(function(data){
    // console.log(data)
    dfd.resolve()
  }).fail(function(jqXHR, textStatus, errorThrown){
    // console.log(jqXHR, textStatus, errorThrown)
    dfd.reject()
  })
  return dfd.promise()
}

// Saves an email and password to local storage,
// for page_action.js to use when POSTing to the
// Feedbin API.
var saveCredentials = function(email, password){
  var dfd = $.Deferred()
  chrome.storage.local.set({
    credentials: {
      email: email,
      password: password
    }
  }, function(){
    dfd.resolve()
  })
  return dfd.promise()
}

// Loads an email and password (or null and null if
// no details have been saved) from local storage.
var loadCredentials = function(){
  var dfd = $.Deferred()
  chrome.storage.local.get('credentials', function(result){
    if('credentials' in result){
      dfd.resolve(result.credentials.email, result.credentials.password)
    } else {
      dfd.resolve(null, null)
    }
  })
  return dfd.promise()
}

// Removes saved email and password from local storage.
var clearCredentials = function(){
  var dfd = $.Deferred()
  chrome.storage.local.remove('credentials', dfd.resolve)
  return dfd.promise()
}

$(function(){

  // If the user has previously entered an email and password
  // show it in the input boxes, and disable the form.
  loadCredentials().done(function(email, password){
    if(email && password){
      $('#email').val(email).attr('disabled', true)
      $('#password').val(password).attr('disabled', true)
      $('#save').hide()
      $('#clear').css('display', 'inline-block')
    }
  }).fail(function(){
    $('header').append('<div class="alert alert-danger"><strong>Oh dear!</strong> Your login details could not be retrieved from local storage. Try reloading the page?</div>')
  })

  // A new email and password have been submitted.
  // Check they are valid, then save them if so.
  $('form').on('submit', function(e){
    e.preventDefault()
    $('.alert').remove()
    $('#save').attr('disabled', true).html('Saving&hellip;')

    var email = $('#email').val()
    var password = $('#password').val()

    verifyCredentials(email, password).done(function(){
      saveCredentials(email, password).done(function(){
        $('header').append('<div class="alert alert-success"><strong><span class="glyphicon glyphicon-ok"></span> Login details saved.</strong> Time to start subscribing to feeds!</div>')
        $('#save').attr('disabled', false).html('Save').hide()
        $('#email, #password').attr('disabled', true)
        $('#clear').css('display', 'inline-block')
      }).fail(function(){
        $('header').append('<div class="alert alert-danger"><strong>Oh dear!</strong> Your login details could not be saved. Please try again.</div>')
        $('#save').attr('disabled', false).html('Save')
      })
    }).fail(function(){
      $('header').append('<div class="alert alert-danger"><strong>Oh dear!</strong> Authentication failed. Are you sure those are the right login details?</div>')
      $('#save').attr('disabled', false).html('Save')
    })
  })

  // User wants to clear their saved details.
  $('#clear').on('click', function(){
    clearCredentials().done(function(){
      $('#email, #password').val('').attr('disabled', false)
      $('#save').show()
      $('#clear').hide()
      $('#email').focus()
    })
  })

})
