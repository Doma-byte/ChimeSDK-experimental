package com.amazonaws.services.chime.rndemo;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import android.net.Uri;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.media.AudioManager;
import android.content.Context;

public class RNRingtoneModule extends ReactContextBaseJavaModule {
  private final ReactApplicationContext reactContext;
  private Ringtone ringtone;
  private AudioManager audioManager;

  public RNRingtoneModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  public String getName() {
    return "RNRingtone";
  }

  @ReactMethod
  public void play() {

    audioManager = (AudioManager) reactContext.getSystemService(Context.AUDIO_SERVICE);
    audioManager.setSpeakerphoneOn(true);

    Uri notification = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
    ringtone = RingtoneManager.getRingtone(reactContext, notification);
    ringtone.play();
  }

  @ReactMethod
  public void stop() {
    if (ringtone != null && ringtone.isPlaying()) {
        ringtone.stop();
        ringtone = null;
    }
  }
}