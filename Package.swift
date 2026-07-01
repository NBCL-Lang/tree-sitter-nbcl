// swift-tools-version:5.3

import Foundation
import PackageDescription

var sources = ["src/parser.c"]
if FileManager.default.fileExists(atPath: "src/scanner.c") {
    sources.append("src/scanner.c")
}

let package = Package(
    name: "TreeSitterNbcl",
    products: [
        .library(name: "TreeSitterNbcl", targets: ["TreeSitterNbcl"]),
    ],
    dependencies: [
        .package(name: "SwiftTreeSitter", url: "https://github.com/tree-sitter/swift-tree-sitter", from: "0.9.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterNbcl",
            dependencies: [],
            path: ".",
            sources: sources,
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterNbclTests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterNbcl",
            ],
            path: "bindings/swift/TreeSitterNbclTests"
        )
    ],
    cLanguageStandard: .c11
)
