import {Text} from "react-native";
import textTheme from "../../constants/TextTheme";

export const DynamicBoldText = ({ text, textStyle }) => {
    return (
        <Text style={textStyle}>
            {text.split(/(<b>.*?<\/b>)/g).map((part, index) =>
                part.startsWith("<b>") && part.endsWith("</b>") ? (
                    <Text key={index} style={[textTheme.bodyMedium, { fontWeight: "bold" }]}>
                        {part.slice(3, -4)}
                    </Text>
                ) : (
                    part
                )
            )}
        </Text>
    );
}