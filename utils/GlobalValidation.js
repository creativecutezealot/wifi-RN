import React, { Component } from "react";
var hasOwnProperty = Object.prototype.hasOwnProperty;

const GlobalValidations = {

    isFieldEmpty: text => {
        if (text) {
            if (text.length > 0) {
                text.replace(/\s*$/, "");
                if (text == "") {
                    return true;
                }
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    },
    isFieldEmpty2: text => {
        // text.replace(/\s*$/,"");
        if (text == "") {
            return true;
        }
        return false;
    },

    isEmailInvalid: text => {
        // let reg = "[A-Z0-9a-z]+([._%+-]{1}[A-Z0-9a-z]+)*@" + "[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$";
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (reg.test(text) === false) {
            return true;
        }
        return false;
    },
    isNumber: text => {
        let reg = /^[0-9]*$/;
        if (reg.test(text) === true) {
            return true;
        }
        return false;
    },
    isNumberForBagSize: text => {
        let reg = /^[1-9]*$/;
        if (reg.test(text) === true) {
            return true;
        }
        return false;
    },
    isTextLengthInvalid: (text, length) => {
        if (text.length < length) {
            return true;
        }
        return false;
    },
    isTwoTextInputsSame: (text1, text2) => {
        text1.replace(/\s*$/, "");
        text2.replace(/\s*$/, "");

        if (text1 === text2) {
            return true;
        }
        return false;
    },
    isZipCodeInvalid: text => {
        let isValidZip = /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(text);

        if (!isValidZip) {
            return true;
        }
        return false;
    },
    isObjectEmpty: obj => {
        // null and undefined are "empty"
        if (obj == null) return true;

        // Assume if it has a length property with a non-zero value
        // that that property is correct.
        if (obj.length > 0) return false;
        if (obj.length === 0) return true;

        // If it isn't an object at this point
        // it is empty, but it can't be anything *but* empty
        // Is it empty?  Depends on your application.
        if (typeof obj !== "object") return true;

        // Otherwise, does it have any properties of its own?
        // Note that this doesn't handle
        // toString and valueOf enumeration bugs in IE < 9
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) return false;
        }

        return true;
    },
    isUrl: s => {
        // var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)? (\/|\/([\w#!:.?+=&%@!\-\/]))?/
        let regexp = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
        console.log('regexp.test(s) :>> ', regexp.test(s));
        return !regexp.test(s);
    }
};

export default GlobalValidations;
