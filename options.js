
// Checks the given email and password are valid
// Feedbin credentials. Returns a jQuery deferred object,
// onto which you can chain .done() and .fail() callbacks.
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
    console.log(data)
    dfd.resolve()
  }).fail(function(jqXHR, textStatus, errorThrown){
    console.log(jqXHR, textStatus, errorThrown)
    dfd.reject()
  })
  return dfd.promise()
}

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

var clearCredentials = function(){
  var dfd = $.Deferred()
  chrome.storage.local.remove('credentials', dfd.resolve)
  return dfd.promise()
}

$(function(){

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

  $('#clear').on('click', function(){
    clearCredentials().done(function(){
      $('#email, #password').val('').attr('disabled', false)
      $('#save').show()
      $('#clear').hide()
      $('#email').focus()
    })
  })

})
