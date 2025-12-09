package com.safetnetsecurity

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {
  override fun getMainComponentName(): String = "SafeTNetSecurity"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
    DefaultReactActivityDelegate(
      this,
      mainComponentName,
      DefaultNewArchitectureEntryPoint.fabricEnabled && DefaultNewArchitectureEntryPoint.concurrentReactEnabled,
    )
}

