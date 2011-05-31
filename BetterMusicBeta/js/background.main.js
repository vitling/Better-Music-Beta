function FindMusicBetaTab(callback) {
  chrome.windows.getAll({populate: true}, function(windows) {
      for (var window = 0; window < windows.length; window++) {
        for (var i = 0; i < windows[window].tabs.length; i++) {
          if (windows[window].tabs[i].url.
              indexOf('http://music.google.com/music/listen') == 0) {
            callback(windows[window].tabs[i].id)
            return;
          }
        }
      }
      callback(null);
    });  
}

// Get the play state from a MusicBeta tab and call UpdateIcon with it.
function CurrentMusicID() {
  FindMusicBetaTab(function(tab_id) {
      if (tab_id)
        chrome.tabs.sendRequest(tab_id, "getPlayState", ToastyPopupPrepare);
    });
}

function ToastyPopupPrepare(state){
  if(state == CurrentSongInfo || state == "notplaying"){
    
  }
  else{
    CurrentSongInfo = state;
    songArray = new Array();
    songArray = CurrentSongInfo.split('|');
    ToastyPopup(songArray[0], songArray[1], songArray[2]);
  }
}

function ToastyPopup(icon, title, artist){
  TrackToast();
  // Create a simple text notification:
  if(icon == "notplaying" || icon == "default_album_med.png"){
    icon = "logo-48x48.png";
  }
  else{
    icon = "http:" + icon;
  }
  var notification = webkitNotifications.createNotification(
    icon,
    title,
    artist
  );
  // Then show the notification
  notification.show();
  // Then auto close!
  setTimeout(function(){
      notification.cancel();
      }, '6000');

}

function TrackToast(){
  _gaq.push(['_trackEvent', 'MusicToast', 'Toast']);
}

// Initial toast based on initial state when we get loaded.
CurrentMusicID();

// React to tabs notifications by updating our icon state if needed.
chrome.tabs.onAttached.addListener(CurrentMusicID);
chrome.tabs.onDetached.addListener(CurrentMusicID);
chrome.tabs.onCreated.addListener(CurrentMusicID);
chrome.tabs.onRemoved.addListener(CurrentMusicID);
chrome.tabs.onUpdated.addListener(CurrentMusicID);

// Called when the song info state changes.
chrome.extension.onRequest.addListener(function(message, sender, callback) {
    CurrentMusicID();
    callback();
  });