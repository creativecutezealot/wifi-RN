import AsyncStorage from '@react-native-community/async-storage';

export function saveData(key, detail, success, failure) {
    AsyncStorage.setItem(key, JSON.stringify(detail)).then(data => success(data), fail => failure(fail))
}

export function getData(key, success, failure) {
    AsyncStorage.getItem(key)
        .then(data => success(JSON.parse(data)), fail => failure(fail))
}

export function removeData(key, success, failure) {
    AsyncStorage.removeItem(key).then(data => success(data), fail => failure(fail))
}

export function clearAllData(success, failure) {
    AsyncStorage.getAllKeys()
        .then(keys => AsyncStorage.multiRemove(keys))
        .then(data => success(data), fail => failure(fail));
}