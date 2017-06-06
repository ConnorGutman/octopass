const bitcoin = require('bitcoinjs-lib')
const bitcoinMessage = require('bitcoinjs-message')

const pass = 'password'; //Change this to whatever your password is

//chrome.storage.sync.set({
//'keys': '[{"name": "ProductHunt","key": "L2vgWn7VexL78WAaqTrDi7mbrz7uz6s2xuhv8cJwhDpSNAHsSgWQ"}]'
//}, function() {
// Notify that we saved.
//console.log('Settings saved');
//});

chrome.storage.sync.get("keys", function(obj) {
  let keys = JSON.parse(obj.keys)

  function listAccounts() {
    let accounts = [];
    keys.forEach(function(account) {
      accounts.push(account.name)
    });
    return accounts;
  }

  function outputAccounts() {
    let accounts = listAccounts();
    let list = document.getElementById("accounts");
    list.innerHTML = `<div class="account new" id="newAccount"><div class="circle" id="newAccountCircle"><div class="circle__inner"><div class="circle__wrapper"><div class="circle__content" id="newCircle"><i class="material-icons key-icon" id="newIcon">add</i></div></div></div></div><h2 class="text-center" id="newText">New Account</h2><input id="newName" type="text" /><button id="submitAccount"><i class="material-icons">done</i></button></div>`;
    for (let i = 0; i < accounts.length; i++) {
      list.innerHTML += `<div class="account a${i}"><i class="material-icons accountSettings">settings</i><div class="circle"><div class="circle__inner"><div class="circle__wrapper"><div class="circle__content"><h1>${accounts[i].charAt(0)}</h1><i class="material-icons sites">vpn_key</i></div></div></div></div><h2 class="text-center">${accounts[i]}</h2></div>`;
    }

    let newIsActive = false;

    document.getElementById("newAccountCircle").onclick = newToggle;

    function newToggle() {
      console.log(newIsActive)
      if (newIsActive == false) {
        document.getElementById("newIcon").className = 'material-icons key-icon spin';
        document.getElementById("newText").style.display = 'none';
        document.getElementById("newName").style.display = 'inline-block';
        document.getElementById("submitAccount").style.display = 'inline-block';
        document.getElementById("newName").focus();
        newIsActive = true;
      } else {
        document.getElementById("newIcon").className = 'material-icons key-icon';
        document.getElementById("newText").style.display = 'block';
        document.getElementById("newName").style.display = 'none';
        document.getElementById("submitAccount").style.display = 'none';
        newIsActive = false;
      }
    };

    document.getElementById("submitAccount").onclick = function() {
      let newAccountValue = document.getElementById("newName").value;
      newToggle()
      addAccount(newAccountValue);
    };

    let $accountSettings = document.querySelectorAll('.accountSettings');

    let settingsIsActive = false;

    function toggleAccountSettings() {
      let account = this.parentNode;
      let accountElements = account.childNodes;
      let circleContents = accountElements[1].childNodes;
      if (settingsIsActive == false) {
        accountElements[0].innerHTML = 'highlight_off';
        accountElements[0].style.color = '#FEBF85';
        accountElements[1].getElementsByClassName("circle__content")[0].innerHTML = '<i class="material-icons">delete</i>';
        accountElements[2].style.display = 'none';
        account.innerHTML += '<input type="text" /><button><i class="material-icons">done</i></button>';
        //account.innerHTML += `<button class="settings-btn">Edit Name</button><button class="settings-btn">Refresh Password</button><button class="settings-btn">Delete</button>`;
        settingsIsActive = true;
      } else {
        accountElements[0].innerHTML = 'settings';
        accountElements[0].style.color = '#DCE5E5';
        accountElements[1].getElementsByClassName("circle__content")[0].innerHTML = '<i class="material-icons">vpn_key</i>';
        accountElements[2].style.display = 'inline-block';
        settingsIsActive = false;
      }
    }

    for (var i = 0; i < $accountSettings.length; i++) {
      $accountSettings[i].addEventListener("click", toggleAccountSettings, false);
    }

  }

  function updateList() {
    let list = document.getElementById("accounts");
    list.innerHTML = ``;
    outputAccounts();
  }

  function getAccount(name) {
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].name == name) {
        return keys[i];
      }
    }
  }

  function addAccount(name) {
    let keyPair = bitcoin.ECPair.makeRandom();
    let privateKey = keyPair.toWIF();
    keys.push({
      "name": name,
      "key": privateKey
    });
    console.log(JSON.stringify(keys))
    chrome.storage.sync.set({
      'keys': JSON.stringify(keys)
    }, function() {
      // Notify that we saved.
      console.log('Settings saved');
    });
    updateList();
  }

  function signMessage(passKey, passMessage) {
    let keyPair = bitcoin.ECPair.fromWIF(passKey.key);
    let privateKey = keyPair.d.toBuffer(32);
    let message = passMessage;
    let messagePrefix = bitcoin.networks.bitcoin.messagePrefix;
    let signature = bitcoinMessage.sign(message, messagePrefix, privateKey, keyPair.compressed);
    return signature.toString('base64');
  }

  function generatePassword(name, pass) {
    try {
      let account = getAccount(name);
      let password = signMessage(account, pass);
      let regex = new RegExp('[^0123456789aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ!#$%&*]', 'g');
      password = password.replace(regex, '');
      //document.getElementById("password").innerHTML = password;
      return password;
    } catch (err) {
      console.log('Account does not exist.');
    }
  }

  outputAccounts();
  //console.log(addAccount('Twitter'))
  console.log(generatePassword('Etsy', pass));

});
