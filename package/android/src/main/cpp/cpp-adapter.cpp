#include <jni.h>
#include "nitrocookiesOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return facebook::jni::initialize(vm, [=] {
    margelo::nitro::nitrocookies::registerAllNatives();
  });
}
