# [1.6.0](https://github.com/tada5hi/hevi/compare/v1.5.0...v1.6.0) (2025-03-24)


### Bug Fixes

* change output directory for helm packages and index ([92065db](https://github.com/tada5hi/hevi/commit/92065db78df971051c3017cd9c2b3aea118efb2f))
* ensure dependency is included in scanned directories ([703e8b8](https://github.com/tada5hi/hevi/commit/703e8b84829593d9f61df1e7ad0f709c5fd819b9))


### Features

* add helm repos on the fly ([65fe069](https://github.com/tada5hi/hevi/commit/65fe069f1d0605c6c5ed118e6b1c58443a36f108))
* use native fs module for (rm|mk)dir ([733d56c](https://github.com/tada5hi/hevi/commit/733d56ca74d8ccce681632e413bedb7d601875bb))

# [1.5.0](https://github.com/tada5hi/hevi/compare/v1.4.0...v1.5.0) (2025-03-21)


### Bug Fixes

* normalizing release chart options ([27f49d6](https://github.com/tada5hi/hevi/commit/27f49d6cec0cfa5946926d14e657253cda0fdd01))


### Features

* simplified versionize command + remove git capabilities ([8351b44](https://github.com/tada5hi/hevi/commit/8351b44b1c53fcf66a83e854d26434f786ac782b))

# [1.4.0](https://github.com/tada5hi/hevi/compare/v1.3.0...v1.4.0) (2025-03-21)


### Bug Fixes

* release command ([ad81246](https://github.com/tada5hi/hevi/commit/ad812460cf2ef20c875c4c0c298c9ca264120218))


### Features

* abstract binary class for helm & helm-chart-releaser ([42afe75](https://github.com/tada5hi/hevi/commit/42afe750d4c9e2fcf86f3e888659a4be532cb4de))
* binary proxy for helm & helm-chart-releaser ([d9e8276](https://github.com/tada5hi/hevi/commit/d9e8276593f96523e4c42436319b6918c301b0fb))
* enable pushing to remote oci registry ([f29c16e](https://github.com/tada5hi/hevi/commit/f29c16e4cf44acd090bfb726947e7eab21d69dfe))
* externalize download and unpack helpers ([989f82c](https://github.com/tada5hi/hevi/commit/989f82ca434e9208556c9be175f423216f5468c0))
* rename version command to versionize ([ee2c546](https://github.com/tada5hi/hevi/commit/ee2c546d0f171507608125345e5e93a132c8155c))

# [1.3.0](https://github.com/tada5hi/hevi/compare/v1.2.0...v1.3.0) (2025-03-19)


### Bug Fixes

* adjust helm releaser directory and binary name ([d243857](https://github.com/tada5hi/hevi/commit/d2438574fe665a0dc2b62a069ee9cf7afb303e79))
* consider arch in exec directory path ([b032be4](https://github.com/tada5hi/hevi/commit/b032be4ea79b310e91b29726e85e220129c76f3a))
* **deps:** bump the minorandpatch group across 1 directory with 3 updates ([#12](https://github.com/tada5hi/hevi/issues/12)) ([bf2f311](https://github.com/tada5hi/hevi/commit/bf2f311e6895cb87d7321db9e441721e2870bbc6))
* simplify repository file path access of chart dependency ([cc37b91](https://github.com/tada5hi/hevi/commit/cc37b9108411f9de7722ac9176fcbe6c21518e95))


### Features

* integrate helm releaser & helm charts manager ([#10](https://github.com/tada5hi/hevi/issues/10)) ([535b8e5](https://github.com/tada5hi/hevi/commit/535b8e5966b314e32d4302703c59e8bc64a9749f))
* organize helm charts as (directed) graph ([ae9f305](https://github.com/tada5hi/hevi/commit/ae9f3056378eece3bab39416de71fbd992659f4a))

# [1.2.0](https://github.com/tada5hi/hevi/compare/v1.1.2...v1.2.0) (2025-03-13)


### Bug Fixes

* check exitCode of child proccess ([d54ef61](https://github.com/tada5hi/hevi/commit/d54ef611fb8ead29fb156e91bbe094a10cb6694e))
* do not ammend commit message ([a0a3cce](https://github.com/tada5hi/hevi/commit/a0a3cce8166175b80a92bbc9bebe0a62f6f97d52))


### Features

* add git add command before commit ([d82cf63](https://github.com/tada5hi/hevi/commit/d82cf63f0c97fee749cd08cdaae7462f063936b0))
* apply --follow-tags and --atomic option to git push ([0e88c6c](https://github.com/tada5hi/hevi/commit/0e88c6c9dff89c63c4a0322429b6640e617320c2))

## [1.1.2](https://github.com/tada5hi/hevi/compare/v1.1.1...v1.1.2) (2025-03-13)


### Bug Fixes

* passing args to sub process ([7c4de01](https://github.com/tada5hi/hevi/commit/7c4de014ec7e6808fa0242e7b1e50183a6ee7c8e))

## [1.1.1](https://github.com/tada5hi/hevi/compare/v1.1.0...v1.1.1) (2025-03-13)


### Bug Fixes

* compute sha of base64 content ([b96fe57](https://github.com/tada5hi/hevi/commit/b96fe57ae0f507264e990b30c44cbb81dc30d096))
* remove github client ([4c72bbd](https://github.com/tada5hi/hevi/commit/4c72bbdef0b747be34bf07849a0bb28b64e02f00))
* remove singleton api for github client ([e9b4086](https://github.com/tada5hi/hevi/commit/e9b4086abb5d5f35e87209267f0e2b4c3e94b2cf))

# [1.1.0](https://github.com/tada5hi/hevi/compare/v1.0.0...v1.1.0) (2025-03-12)


### Bug Fixes

* change commit message prefix ([4b82dd7](https://github.com/tada5hi/hevi/commit/4b82dd75000c46ba95a34d470999d10a9efb78b5))


### Features

* normalize execute options & restructured src code ([a1c1404](https://github.com/tada5hi/hevi/commit/a1c14040f2fed590d56b7cfa95b220368b9681a1))

# 1.0.0 (2025-03-10)


### Bug Fixes

* add missing bin/env header in cli index file ([a9b798f](https://github.com/tada5hi/hevi/commit/a9b798f9e72efe8f6ce4de134fa855a0e57fed82))
* enhance cli log messages ([222d1a7](https://github.com/tada5hi/hevi/commit/222d1a7923e6d878d206af70982ba5f3b38f0b76))


### Features

* add git commit & push support ([8bd25f5](https://github.com/tada5hi/hevi/commit/8bd25f5e800e8f08775e2f398d7a45e68112b598))
* add logging to cli entrypoint ([59bd943](https://github.com/tada5hi/hevi/commit/59bd9433b0ce7ab3f88822cb5e85b688279d1ae8))
* initial git integration & cli implementation ([#5](https://github.com/tada5hi/hevi/issues/5)) ([e014239](https://github.com/tada5hi/hevi/commit/e0142390c9790f5ac43598e387091dcf975cc67a))
* initial repository from source ([90e253e](https://github.com/tada5hi/hevi/commit/90e253e32b5215b24705e46d010f0b5695193e13))
