import { Box, Button, InlineStack, Text, Thumbnail } from "@shopify/polaris";
import "./styles.css";
import Logo from "./company-logo-512.svg";

export default function Footer() {
  return (
    <footer>
      <Box paddingInline="400" paddingBlockStart="400" paddingBlockEnd="300">
        <Button
          url="https://joshuabee.dev/"
          target="true"
          variant="monochromePlain"
          textAlign="start"
        >
          <InlineStack gap="400" wrap={false} blockAlign="center">
            <Thumbnail source={Logo} alt="Company Logo" />

            <Text as="p" variant="bodyLg">
              Joshua
              <br />
              Bee
            </Text>
          </InlineStack>
        </Button>
      </Box>
    </footer>
  );
}
