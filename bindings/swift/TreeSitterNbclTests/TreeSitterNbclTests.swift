import XCTest
import SwiftTreeSitter
import TreeSitterNbcl

final class TreeSitterNbclTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_nbcl())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Nbcl grammar")
    }
}
