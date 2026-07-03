/**
 * @file Tree sitter for Node Based Configuration Language (NBCL)
 * @author Byson94 <byson94wastaken@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "nbcl",

  extras: $ => [/\s/],

  conflicts: $ => [
    [$._definition, $.node_block],
    [$._definition, $._primary_expr],
    [$.function_call, $._primary_expr],
    [$.node_invocation, $._primary_expr],
    [$.node_invocation, $.literal],
    [$.node_block, $.map],
    [$.import_stmt],
    [$.block, $.map]
  ],

  rules: {
    source_file: $ => repeat($._definition),
    
    _definition: $ => choice(
      $.comment,
      $.variable_declaration,
      $.function_definition,
      $.function_call,
      $.node_invocation,
      $.if_expr,
      $.match_expr,
      $.import_stmt,
      $.import_lib_stmt,
      $.loops,
      $.component,
      $.standalone_kw,
      $._expression
    ),

    // Variable and function calls
    variable_declaration: $ => seq(
      choice("let", "const", "set"),
      $._assignable_lhs,
      choice("+=", "-=", "*=", "/=", "="),
      $._expression
    ),

    _assignable_lhs: $ => seq(
      $._primary_expr,
      repeat(choice(
        seq(choice(".", "?."), $.snake_ident),
        seq("[", $._expression, "]"),
      )),
    ),

    function_definition: $ => seq(
      "fn",
      $.snake_ident,
      "(",
      optional($.snake_ident),
      ")",
      $.block
    ),

    block: $ => seq(
      "{",
      repeat($._definition),
      "}"
    ),

    function_call: $ => seq(
      $.snake_ident,
      "(",
      optional($._expression),
      ")",
    ),

    // Nodes
    node_invocation: $ => seq(
      $.pascal_ident,
      optional(choice($.string, $._postfix_expr, $.snake_ident)),
      $.node_block
    ),

    node_block: $ => seq(
      "{",
      repeat(choice(
        $.map_pair,
        $.node_invocation,
        $._definition
      )),
      "}"
    ),

    // component
    component: $ => seq(
      "component",
      $.pascal_ident,
      $.component_params,
      $.node_block
    ),
    
    component_params: $ => seq(
      "(",
      optional(choice(
        $.component_param_list,
        seq("any", ":", $.snake_ident)
      )),
      ")"
    ),
    
    component_param_list: $ => seq(
      $.snake_ident,
      repeat(seq(",", $.snake_ident)),
      optional(",")
    ),

    // conditionals
    if_expr: $ => prec(1, seq(
      "if",
      $._expression,
      $.block,
      repeat(seq("else", "if", $._expression, $.block)),
      optional(seq("else", $.block))
    )),

    match_expr: $ => seq(
      "match",
      $._expression,
      "{",
      repeat1($.match_arm),
      "}",
    ),

    match_arm: $ => seq(
      choice("_", $.literal, $.snake_ident),
      "=>",
      choice($.block, seq($._expression, optional(","))),
    ),
    
    // loops
    loops: $ => choice($.for_loop, $.while_loop),
    for_loop: $ => seq("for", $.snake_ident, "in", $._expression, $.block),
    while_loop: $ => seq("while", $._expression, $.block),

    // imports 
    import_stmt: $ => seq(
      "import",
      $.string,
      "as",
      $.snake_ident,
      optional(seq(
        "{",
        choice(
          $.import_list,
          "*",
        ),
        "}"
      )),
    ),

    import_list: $ => seq(
      choice($.snake_ident, $.pascal_ident),
      repeat(seq(",", choice($.snake_ident, $.pascal_ident))),
      optional(",") 
    ),

    import_lib_stmt: $ => seq(
      "import",
      $.snake_ident,
      ".",
      $.snake_ident
    ),

    // standalone keywords
    standalone_kw: $ => choice("return"),

    // expressions
    range_expr: $ => prec(1, seq($._expression, choice("..=", ".."), $._expression)),

    _expression: $ => choice(
      $.binary_expression,
      $.unary_expression,
      $._postfix_expr,
    ),

    unary_expression: $ => choice(
      prec.left(9, seq("!", $._expression)),
      prec.left(9, seq("-", $._expression)),
    ),

    binary_expression: $ => choice(
      prec.left(8, seq($._expression, choice("*", "/", "%"), $._expression)),
      prec.left(7, seq($._expression, choice("+", "-"), $._expression)),
      prec.left(6, seq($._expression, choice("==", "!=", "<=", ">=", "<", ">"), $._expression)),
      prec.left(5, seq($._expression, "&&", $._expression)),
      prec.left(4, seq($._expression, "||", $._expression)),
    ),

    _postfix_expr: $ => choice(
      $._primary_expr,
      prec(10, seq($._postfix_expr, choice(".", "?."), $.snake_ident)),
      prec(10, seq($._postfix_expr, "[", $._expression, "]")),
      prec(10, seq($._postfix_expr, $.call_args)),
    ),

    call_args: $ => seq(
      "(",
      optional(seq($._expression, repeat(seq(",", $._expression)))),
      ")",
    ),

    _primary_expr: $ => choice(
      $.literal,
      $.lambda_expr,
      $.if_expr,
      $.match_expr,
      seq("(", $._expression, ")"),
      $.snake_ident,
    ),

    lambda_expr: $ => seq(
      "|",
      optional(seq($.snake_ident, repeat(seq(",", $.snake_ident)))),
      "|",
      choice($.block, $._expression),
    ),

    // literals
    literal: $ => choice(
      $.float,
      $.integer,
      $.boolean,
      $.null,
      $.string,
      $.array,
      $.map,
    ),

    integer: $ => /-?[0-9]+/,
    float: $ => /-?[0-9]+\.[0-9]+/,
    boolean: $ => choice("true", "false"),
    null: $ => "null",

    string: $ => seq(
      optional(choice("f", "r")),
      choice(
        seq('"', repeat(choice(/[^"\\]/, $.escape_sequence)), '"'),
        seq("'", repeat(choice(/[^'\\]/, $.escape_sequence)), "'"),
      ),
    ),

    escape_sequence: $ => /\\[ntr\\'""u][0-9a-fA-F]{0,4}/,

    array: $ => seq(
      "[",
      optional(seq(
        choice($.spread, $._expression),
        repeat(seq(",", choice($.spread, $._expression))),
        optional(","),
      )),
      "]",
    ),

    spread: $ => seq("...", $._expression),

    map: $ => seq(
      "{",
      repeat(choice(
        $.map_pair,
        $.spread,
      )),
      "}"
    ),

    map_pair: $ => seq(
      $.snake_ident,
      "=",
      $._expression
    ),
    
    comment: $ => choice(
      /#[^\n]*/,
      seq("#-", repeat(choice(/.[^-]*/, /-[^#]/)), "-#"),
    ),
    snake_ident: $ => /[a-z_][a-zA-Z0-9_]*/,
    pascal_ident: $ => /[A-Z][a-zA-Z0-9_]*/
  }
});
