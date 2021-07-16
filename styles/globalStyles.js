import { StyleSheet } from "react-native";
import { colors, fonts } from ".";

const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white
    },
    icon: {
        width: (20),
        height: (20)
    },
    // noRecordsView: {
    //     alignSelf: 'center',
    //     justifyContent: 'center',
    //     color: colors.FONT_BLACK,
    //     fontFamily: fonts.MEDIUM,
    //     fontSize: (16),
    //     flex: 1,
    //     textAlignVertical: 'center'
    // },
})

export default globalStyles;