function saveChanges() {
  // Get a value saved in a form.
  var theValue = 'test data.';
  // Check that there's some code there.
  if (!theValue) {
    message('Error: No value specified');
    return;
  }
  // Save it using the Chrome extension storage API.
  chrome.storage.sync.set({
    'value': theValue
  }, function() {
    // Notify that we saved.
    window.alert('Settings saved');
  });
}

function getKeys() {
  chrome.storage.sync.get("value", function (obj) {
    console.log(obj);
});
}

saveChanges()
getKeys()
