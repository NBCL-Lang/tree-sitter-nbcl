; === Keywords ===
["let" "const" "set" "fn" "component" "if" "else" "match" "for" "in" "while" "return" "import" "as"] @keyword

; === Identifiers and Definitions ===
(function_definition (snake_ident) @function.definition)
(function_call (snake_ident) @function)
(node_invocation (pascal_ident) @type)
(component (pascal_ident) @type)

; Properties and keys
(map_pair (snake_ident) @variable.other.member)
(import_list [ (snake_ident) (pascal_ident) ] @variable)

; Fallback identifiers
(snake_ident) @variable
(pascal_ident) @type

; === Literals ===
(integer) @number
(float) @number
(boolean) @boolean
(null) @constant.builtin
(string) @string
(escape_sequence) @constant.character.escape

; === Structuring Elements ===
(comment) @comment
(spread) @keyword.operator

; === Operators and Punctuation ===
["=" "+=" "-=" "*=" "/="] @keyword.operator
["+" "-" "*" "/" "%" "==" "!=" "<" ">" "<=" ">=" "&&" "||" "!" "=>"] @operator
; highlight '..' and '..='
(_ [ "." ] @operator (#match? @operator "^\\.\\.=?$"))
["." "?."] @punctuation.delimiter
["," "(" ")" "[" "]" "{" "}"] @punctuation.bracket
