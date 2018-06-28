"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var rest_1 = __importDefault(require("@octokit/rest"));
var s3 = new aws_sdk_1.default.S3();
var octokit = new rest_1.default();
exports.handler = function (event) { return __awaiter(_this, void 0, void 0, function () {
    var bucketName, filePath, _a, GITHUB_TOKEN, GITHUB_USERNAME, GITHUB_REPO, githubIdentifiers, _, fileContents, baseRef, workingTreeRef, commitRef, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                bucketName = event.Records[0].s3.bucket.name;
                filePath = event.Records[0].s3.key;
                _a = process.env, GITHUB_TOKEN = _a.GITHUB_TOKEN, GITHUB_USERNAME = _a.GITHUB_USERNAME, GITHUB_REPO = _a.GITHUB_REPO;
                if (!GITHUB_TOKEN || !GITHUB_USERNAME || !GITHUB_REPO) {
                    throw new Error("Missing environment variables.");
                }
                octokit.authenticate({
                    type: "token",
                    token: GITHUB_TOKEN
                });
                githubIdentifiers = {
                    owner: GITHUB_USERNAME,
                    repo: GITHUB_REPO
                };
                _b.label = 1;
            case 1:
                _b.trys.push([1, 7, , 8]);
                _ = void 0;
                return [4, s3.getObject({ Bucket: bucketName, Key: filePath }).promise()];
            case 2:
                _ = _b.sent();
                fileContents = _ && _.Body ? _.Body.toString() : null;
                if (fileContents === null) {
                    throw new Error("Could not read file contents.");
                }
                return [4, octokit.gitdata.getReference(__assign({}, githubIdentifiers, { ref: "heads/master" }))];
            case 3:
                _ = (_b.sent());
                baseRef = _.data.object.sha;
                return [4, octokit.gitdata.createTree(__assign({}, githubIdentifiers, { tree: [
                            {
                                path: filePath,
                                mode: "100644",
                                type: "blob",
                                content: fileContents
                            }
                        ], base_tree: baseRef }))];
            case 4:
                _ = (_b.sent());
                workingTreeRef = _.data.object.sha;
                return [4, octokit.gitdata.createCommit(__assign({}, githubIdentifiers, { message: "Updated " + filePath, tree: workingTreeRef, parents: [baseRef] }))];
            case 5:
                _ = (_b.sent());
                commitRef = _.data.object.sha;
                return [4, octokit.gitdata.updateReference(__assign({}, githubIdentifiers, { ref: "heads/master", sha: commitRef, force: true }))];
            case 6: return [2, _b.sent()];
            case 7:
                error_1 = _b.sent();
                throw error_1;
            case 8: return [2];
        }
    });
}); };
