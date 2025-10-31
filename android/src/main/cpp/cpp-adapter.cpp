#include <jni.h>
#include "nitrocookiesOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::nitrocookies::initialize(vm);
}
