/**
 * 注入脚本方法
 * @param methodPath 路径
 * @param args 参数
 * @param callback 回调
 */
export const handleCallInjectedMethod = (methodPath: any[], args: any[], callback) => {
  const requestId = Math.random().toString(36).substr(2, 9);

  const handleResponse = (event) => {
    if (event.source !== window) return;
    if (event.data && event.data.type === "Injected_Mehod_Response" && event.data.requestId === requestId) {
      callback(event.data.result);
      window.removeEventListener("message", handleResponse);
    }
  };

  window.addEventListener("message", handleResponse);

  window.postMessage({ type: "Injected_Method_Call", methodPath, args, requestId }, "*");
};

/**
 * 检查条件是否满足，满足则执行回调函数
 * @param conditionFn 检查条件的函数
 * @param callback 条件满足时执行的回调函数
 */
export function handleCheckConditionUntilMet(conditionFn: () => any, callback: () => void, interval = 500) {
  // 检查 conditionFn 是否是函数
  if (typeof conditionFn !== "function") {
    throw new Error("conditionFn 必须是一个函数");
  }

  // 检查 callback 是否是函数
  if (typeof callback !== "function") {
    throw new Error("callback 必须是一个函数");
  }

  // 使用 setInterval 每隔 interval 毫秒检查一次条件
  const intervalId = setInterval(() => {
    if (conditionFn()) {
      // 如果条件满足，则清除定时器并调用回调函数
      clearInterval(intervalId);
      callback();
    }
  }, interval);

  // 返回一个函数用于手动停止检测
  return () => clearInterval(intervalId);
}

/** 获取元素索引 */
export const getElementIndex = (element: Element) => {
  const el = window.getComputedStyle(element);

  // 获取 transform 属性值
  const transformValue = el.transform;

  // 提取 matrix 值中的 translateY (第6个值)
  const matrixValues = transformValue.match(/matrix\((.+)\)/);
  if (!matrixValues) {
    return null; // 无法解析 transform 属性
  }

  const values = matrixValues[1].split(", ");
  const translateY = parseFloat(values[5]);

  // 获取元素的 height
  const height = parseFloat(el.height);

  // 计算 index
  const index = translateY / height;

  return index;
};

/** 构建层级结构 */
export function buildHierarchy(
  data: any[],
  label: string = "name",
  value: string = "id",
  isNeedThree: boolean = true // 是否需要三级
): any[] {
  const groupsMap = new Map<number, any>();

  data.forEach((item) => {
    const group = {
      ...item,
      label: item[label],
      title: item[label],
      value: item[value],
      children: [],
    };

    groupsMap.set(group.id, group);

    if (group.parent_id !== -1) {
      const parentGroup = groupsMap.get(group.parent_id);
      if (parentGroup) {
        parentGroup.children!.push(group);
      }
    }
  });

  // 全部分组
  const topLevelGroups: Option[] = [];
  groupsMap.forEach((group) => {
    if (group.parent_id === -1) {
      topLevelGroups.push(group);
    }
  });

  if (isNeedThree) {
    return topLevelGroups;
  } else {
    const secondLevelGroups = topLevelGroups.map((item) => ({
      ...item,
      children: item.children ? item.children?.map((child) => ({ ...child, children: [] })) : [],
    }));

    return secondLevelGroups;
  }
}

// antd 下拉框数据处理
export const handleSelectOption = (list: any, labelString: string, valueString: string) => {
  return list?.map((item: any) => {
    item["label"] = item[labelString];
    item["value"] = item[valueString];
    item.newChildren = item.children; // 保存原始children
    delete item.children; // 删除原始children
    return item;
  });
};
