# OJ Mapper

여러 온라인 저지의 문제를 연결하고, 기준이 되는 저지와 문제 번호로 동일하거나 유사한 문제를 찾는 프로젝트입니다.  
Map problems across multiple online judges and search for the same or similar problems by judge and problem ID.

## Contributing Problem Data

문제 정보는 문제 하나당 파일 하나로 저장합니다.  
Problem data is stored as one file per problem.

권장 디렉터리 구조는 다음과 같습니다.  
Use this layout.

```text
problems/
  boj/
    1000.yaml
  qoj/
    1000.yaml
  atcoder/
    abc354_a.yaml
  codeforces/
    2220A.yaml
  leetcode/
    two-sum.yaml
```

각 파일에는 아래 정보를 넣습니다.  
Each file should contain the following fields.

```yaml
oj: BOJ
id: "1000"
title: "A+B"
matches:
  - oj: BOJ
    id: "1001"
    relation: similar
  - oj: QOJ
    id: "1000"
    relation: same
```

표기 규칙은 다음과 같습니다.  
Use the following formatting rules.

- `oj`는 `BOJ`, `QOJ`, `Jungol`, `Codeup`, `AtCoder`, `Codeforces`, `LeetCode` 중 하나를 그대로 쓰며, 따옴표 없이 적습니다.  
  Write `oj` as one of `BOJ`, `QOJ`, `Jungol`, `Codeup`, `AtCoder`, `Codeforces`, or `LeetCode`, without quotes.
- `id`는 항상 문자열로 취급하므로 따옴표를 사용합니다. 숫자처럼 보여도 `"1000"`처럼 적습니다.  
  Always treat `id` as a string and use quotes. Even numeric-looking values should be written like `"1000"`.
- `title`도 문자열이므로 따옴표를 사용합니다.  
  Use quotes for `title` as well because it is a string.
- `relation`은 `same` 또는 `similar` 중 하나를 사용하며, 따옴표 없이 적습니다.  
  Write `relation` as either `same` or `similar`, without quotes.

`oj`: 기준이 되는 온라인 저지 이름입니다.  
`oj`: the base online judge name.

`id`: 해당 저지에서 사용하는 문제 번호 또는 문제 ID입니다.  
`id`: the problem ID used by that judge.

`title`: 문제 제목입니다.  
`title`: the problem title.

`matches`: 직접 확인한 관련 문제 목록입니다.  
`matches`: directly known related problems.

`relation`: 완전히 같은 문제는 `same`, 비슷하지만 동일하지는 않은 문제는 `similar`을 사용합니다.  
`relation`: use `same` for the same problem and `similar` for closely related but not identical problems.

OJ 이름과 표기 규칙은 아래를 따릅니다.  
Use the following OJ naming and casing rules.

- 파일 안의 `oj` 값은 `BOJ`, `QOJ`, `Jungol`, `Codeup`, `AtCoder`, `Codeforces`, `LeetCode` 중 하나를 정확히 사용합니다.  
  The `oj` value inside each file must be exactly one of `BOJ`, `QOJ`, `Jungol`, `Codeup`, `AtCoder`, `Codeforces`, or `LeetCode`.
- 디렉터리 이름은 소문자로 고정합니다. 예: `boj`, `qoj`, `jungol`, `codeup`, `atcoder`, `codeforces`, `leetcode`  
  Directory names must be lowercase. Example: `boj`, `qoj`, `jungol`, `codeup`, `atcoder`, `codeforces`, `leetcode`.
- 파일 이름은 해당 저지에서 실제로 쓰는 문제 ID를 기준으로 합니다.  
  File names should follow the actual problem ID used by that judge.
- 숫자형 ID는 그대로 사용합니다. 예: `1000`, `1234`  
  Numeric IDs should be used as-is. Example: `1000`, `1234`.
- Codeforces ID는 대문자 인덱스를 사용합니다. 예: `2220A`, `1700C`, `1A`  
  Codeforces IDs should use uppercase indices. Example: `2220A`, `1700C`, `1A`.
- AtCoder ID는 소문자 형식을 사용합니다. 예: `abc354_a`, `arc100_b`  
  AtCoder IDs should use lowercase form. Example: `abc354_a`, `arc100_b`.
- LeetCode ID는 소문자 slug 형식을 사용합니다. 예: `two-sum`, `merge-k-sorted-lists`  
  LeetCode IDs should use lowercase slug form. Example: `two-sum`, `merge-k-sorted-lists`.

기여 순서는 다음과 같습니다.  
Contribution steps are as follows.

1. `problems/<oj>/<id>.yaml` 파일을 새로 만들거나 수정합니다.  
   Create or edit `problems/<oj>/<id>.yaml`.
2. 가능하면 작은 단위의 PR로 나눠서 올립니다.  
   Prefer small, focused pull requests.
3. 새로운 저지를 추가할 때도 같은 구조와 네이밍 규칙을 유지합니다.  
   If you add a new judge, follow the same structure and naming style.

주의 사항은 다음과 같습니다.  
Please keep the following notes in mind.

- 유사 문제를 모두 같은 문제로 간주하지 말고, 관계를 명시적으로 적어 주세요.  
  Keep relations explicit instead of assuming every similar problem is interchangeable.
