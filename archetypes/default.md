---
title: "{{ replace .Name "-" " " | title }}"
slug: "{{ .Name }}"
date: {{ .Date }}
draft: true
# 文章归属的系列 id（见 data/series.yaml，例如 engineering-backend / engineering-ai / softskills / mindset / career）
series: []
# 系列内章节顺序（配合 series 使用：1, 2, 3 …）
weight: 1
tags: []
summary: "一句话简介（≤ 60 字），会出现在卡片与列表"
featured: false
author: "diunilaomei"
coverEmoji: ""
---

> 写作规范：真实经历优先，不方便公开就脱敏；多写「我在 XX 项目里遇到 XX 问题，我是怎么做的，踩了什么坑」；少堆名词，不复制教科书。

## 背景

（这个问题的上下文是什么？在什么规模、什么约束下遇到的？）

## 我踩过的坑

（真实教训，包含代价）

## 方法 / 取舍

（怎么选、为什么这么选、放弃了什么方案）

## 落地清单

- [ ] 第一条可执行的检查项

<!--more-->
