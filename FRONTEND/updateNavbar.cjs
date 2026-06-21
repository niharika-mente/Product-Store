const fs = require('fs');
const path = 'src/components/ui/Navbar.jsx';
let lines = fs.readFileSync(path, 'utf8').split(/\r?\n/);

// We will find lines to replace and insert.

// 1. Add `useSavedForLater` import.
let importIdx = lines.findIndex(l => l.includes('import { useCart }'));
if (importIdx !== -1 && !lines.find(l => l.includes('useSavedForLater'))) {
  lines.splice(importIdx + 1, 0, 'import { useSavedForLater } from "../../store/savedForLater";');
  lines.splice(importIdx + 2, 0, 'import { Divider } from "@chakra-ui/react";');
}

// 2. Add `useSavedForLater` hook inside Navbar.
let cartHookIdx = lines.findIndex(l => l.includes('const { cartItems, removeFromCart, totalPrice, emptyCart } = useCart();'));
if (cartHookIdx !== -1) {
  lines[cartHookIdx] = '  const { cartItems, removeFromCart, totalPrice, emptyCart, addToCart } = useCart();';
  lines.splice(cartHookIdx + 1, 0, '  const { savedItems, saveForLater, removeFromSaved } = useSavedForLater();');
}

// 3. Add orchestration methods before totalItemsCount
let totalItemsIdx = lines.findIndex(l => l.includes('const totalItemsCount = cartItems.reduce'));
if (totalItemsIdx !== -1 && !lines.find(l => l.includes('handleSaveForLater'))) {
  const orchestrator = [
    '  const handleSaveForLater = async (item) => {',
    '    await saveForLater(item);',
    '    removeFromCart(item._id);',
    '  };',
    '',
    '  const handleMoveToCart = async (item) => {',
    '    const res = addToCart(item, item.quantity || 1);',
    '    if (res.status === "added") {',
    '      await removeFromSaved(item._id);',
    '    } else if (res.status === "capped") {',
    '      toast({ title: "Stock Limit", description: "You can\'t add more of this item.", status: "warning", duration: 3000 });',
    '    } else if (res.status === "out_of_stock") {',
    '      toast({ title: "Out of Stock", description: "This item is currently out of stock.", status: "error", duration: 3000 });',
    '    }',
    '  };',
    ''
  ];
  lines.splice(totalItemsIdx, 0, ...orchestrator);
}

// 4. Update the Remove button exactly
let currentPriceIdx = lines.findIndex(l => l.includes('currentPrice, currency, rates'));
if (currentPriceIdx !== -1) {
  let btnStart = currentPriceIdx + 3;
  if (lines[btnStart].includes('<Button')) {
    lines.splice(btnStart, 8, 
      '                        <VStack>',
      '                          <Button size="sm" colorScheme="blue" variant="outline" onClick={() => handleSaveForLater(item)} width="100%">',
      '                            Save for Later',
      '                          </Button>',
      '                          <Button size="sm" colorScheme="red" variant="ghost" onClick={() => removeFromCart(item._id)} width="100%">',
      '                            Remove',
      '                          </Button>',
      '                        </VStack>'
    );
  }
}

// 5. Add Saved Items section before </DrawerBody>
let drawerBodyEndIdx = lines.lastIndexOf('            </DrawerBody>');
if (drawerBodyEndIdx !== -1 && !lines.find(l => l.includes('savedItems.length > 0'))) {
  const savedItemsBlock = [
    '              {savedItems && savedItems.length > 0 && (',
    '                <Box mt={6}>',
    '                  <Divider mb={4} />',
    '                  <Text fontWeight="bold" fontSize="lg" mb={3}>{t("cart.savedForLater") || "Saved for Later"} ({savedItems.length})</Text>',
    '                  <VStack align="stretch" spacing={4}>',
    '                    {savedItems.map((item) => (',
    '                      <HStack',
    '                        key={item._id}',
    '                        justify="space-between"',
    '                        p={3}',
    '                        borderWidth="1px"',
    '                        borderRadius="lg"',
    '                        borderColor={colorMode === "light" ? "gray.200" : "gray.600"}',
    '                      >',
    '                        <Box>',
    '                          <Text fontWeight="bold">{item.name}</Text>',
    '                          <Text fontSize="sm" color={labelColor}>',
    '                            {formatPrice(item.price, currency, rates)}',
    '                          </Text>',
    '                        </Box>',
    '                        <VStack>',
    '                          <Button size="sm" colorScheme="teal" variant="outline" onClick={() => handleMoveToCart(item)} width="100%">',
    '                            Move to Cart',
    '                          </Button>',
    '                          <Button size="sm" colorScheme="red" variant="ghost" onClick={() => removeFromSaved(item._id)} width="100%">',
    '                            Remove',
    '                          </Button>',
    '                        </VStack>',
    '                      </HStack>',
    '                    ))}',
    '                  </VStack>',
    '                </Box>',
    '              )}'
  ];
  lines.splice(drawerBodyEndIdx, 0, ...savedItemsBlock);
}

fs.writeFileSync(path, lines.join('\n'));
console.log('Navbar updated completely via arrays.');
