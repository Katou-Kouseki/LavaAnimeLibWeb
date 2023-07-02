import { useStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { LavaAnimeAPI, getToken } from "../common/api";
import axios, { AxiosError } from "axios";
import config from "../common/config";

export const useAnimeStore = defineStore("anime", {
  state: () => {
    return {
      laID: null,
      state: {
        animeData: {
          isLoading: true,
          errorCode: null,
          errorMessage: null,
        },
        driveData: {
          isLoading: true,
          errorCode: null,
          errorMessage: null,
        },
        fileData: {
          isLoading: true,
          errorCode: null,
          errorMessage: null,
        },
        driveLoading: null,
      },
      animeData: {},
      driveData: {
        default: null,
        list: [],
      },
      myDrive: useStorage("myDrive", {
        rememberMyChoice: false,
        selectedDrive: null,
      }),
      fileData: {
        activeEpisode: null,
        activeFileIndex: null,
        fileList: [],
      },
      artInstance: null,
      showArtPlayer: false,
    };
  },
  getters: {
    bgmID: (state) => {
      return state.animeData?.bgmID ?? null;
    },
    // 获得活跃文件. AnimePlayer 组件一旦创建就会 watch 此属性
    activeFile: (state) => {
      return state.fileData.fileList[state.fileData.activeFileIndex];
    },
    activeDrive: (state) => {
      // 开启了记住选择 返回曾经的选择
      if (state.myDrive.rememberMyChoice && state.myDrive.selectedDrive) {
        return state.driveData.list.find((drive) => {
          return state.myDrive.selectedDrive == drive.id;
        });
      } else if (state.myDrive.selectedDrive) {
        return state.driveData.list.find((drive) => {
          return state.myDrive.selectedDrive == drive.id;
        });
      } else {
        // 返回默认
        return state.driveData.list.find((drive) => {
          return state.driveData?.default == drive.id;
        });
      }
    },
    // 获取集数和集数对应的视频
    episodeList: (state) => {
      let result = [];
      for (let file of state.fileData.fileList) {
        // 只要解析出集数的视频文件
        if (
          file.type == "file" &&
          file.parseResult?.extensionName?.type == "video" &&
          file.parseResult?.episode
        ) {
          let thisEpObj = result.find(
            (ep) => ep.episode == file.parseResult?.episode
          );
          // 当 Array.find 找不到时, 它将返回 undefined
          if (thisEpObj === undefined) {
            result.push({ episode: file.parseResult.episode, list: [file] });
          } else {
            thisEpObj.list.push(file); // 此处 thisEpObj 是指向 result 中对象的引用
          }
        }
      }
      // 对集数进行排序
      result.sort((a, b) => {
        const aEp = new String(a.episode);
        const bEp = new String(b.episode);
        return (
          parseInt(aEp.match(/\d+/)[0]) - parseInt(bEp.match(/\d+/)[0]) ||
          aEp.length - bEp.length
        );
      });
      return result;
    },
    noEpisodeList: (state) => {
      return state.fileData.fileList.filter((file) => {
        return (
          file.type == "file" &&
          file.parseResult?.extensionName?.type == "video" &&
          !file.parseResult?.episode
        );
      });
    },
    musicList: (state) => {
      return state.fileData.fileList.filter((file) => {
        return (
          file.type == "file" &&
          file.parseResult?.extensionName?.type == "music"
        );
      });
    },
    otherList: (state) => {
      return state.fileData.fileList.filter((file) => {
        return (
          file.type == "file" &&
          !["video", "music"].includes(file.parseResult?.extensionName?.type)
        );
      });
    },
    /**
     * 提供集数, 返回指定集数的视频列表
     * @param {String} episode
     * @returns {Object}
     */
    episodeListFind(state) {
      return (episode) => {
        return this.episodeList.find((epObj) => {
          return epObj.episode == episode;
        });
      };
    },
    isNoBrowser() {
      return (
        this.activeFile?.parseResult?.noBrowser ||
        this.activeFile?.parseResult?.extensionName?.raw == "mkv"
      );
    },
    /**
     * 查找下一个集数, 可能为空
     * @param {String | undefined} episode
     * @returns {String | undefined}
     */
    findNextEpisode(state) {
      return (episode) => {
        if (typeof episode != "string") episode = this.fileData.activeEpisode;
        let currentIndex = this.episodeList.findIndex((findEp) => {
          return findEp.episode == episode;
        });
        return this.episodeList[currentIndex + 1]?.episode;
      };
    },
  },
  actions: {
    /**
     * 初始化界面, 自动获取所有数据
     * @param {Number} laID
     * @returns {Promise}
     */
    async buildPage(laID) {
      this.laID = parseInt(laID);
      this.getAnimeData(laID);
      await (async () => {
        await this.getDriveData();
        await this.getFileData(this.laID, this.activeDrive.id);
        await this.autoPlay();
      })();
    },
    async getAnimeData(laID) {
      this.state.animeData = {
        isLoading: true,
        errorCode: null,
        errorMessage: null,
      };
      this.animeData = {};

      try {
        let result = await LavaAnimeAPI.get("/v2/anime/get", {
          params: { id: laID, full: true },
        });
        this.animeData = result.data.data;
      } catch (error) {
        console.log("获取信息时发生", error, "错误");
        this.state.animeData.errorCode = error.response.status;
        this.state.animeData.errorMessage = error.response?.data?.message;
      } finally {
        this.state.animeData.isLoading = false;
      }
    },
    async getDriveData() {
      this.state.driveData = {
        isLoading: true,
        errorCode: null,
        errorMessage: null,
      };
      this.driveData = {
        default: null,
        list: [],
      };
      try {
        let result = await LavaAnimeAPI.get("/v2/drive/all");
        this.driveData = result.data.data;
        if (!this.myDrive.rememberMyChoice) {
          this.myDrive.selectedDrive = null;
        }
      } catch (error) {
        console.log("获取存储节点信息时发生", error, "错误");
        this.state.driveData.errorCode = error.response.status;
        this.state.driveData.errorMessage = error.response?.data?.message;
      } finally {
        this.state.driveData.isLoading = false;
      }
    },
    async getFileData(laID, drive) {
      this.state.driveLoading = drive; // Loading
      this.showArtPlayer = false;
      this.fileData = {
        activeEpisode: null,
        activeFileIndex: null,
        fileList: [],
      };
      this.state.fileData = {
        isLoading: true,
        errorCode: null,
        errorMessage: null,
      };
      try {
        let result = await LavaAnimeAPI.get("/v2/anime/file", {
          params: { id: laID, drive: drive },
        });
        this.fileData.fileList = result.data.data;
        if (this.fileData.fileList.length) {
          // 确保没有出错以及有结果才启动播放器
          this.showArtPlayer = true;
        }
      } catch (error) {
        console.log("获取文件列表时发生", error, "错误");
        this.state.fileData.errorCode = error?.response?.status ?? error.code;
        this.state.fileData.errorMessage =
          error?.response?.data?.message ?? error.message;
      } finally {
        this.state.fileData.isLoading = false;
        this.state.driveLoading = null; // End loading
      }
    },
    /**
     * 通过节点 ID 切换当前节点
     * @param {String} newDrive 节点 ID
     */
    async changeDrive(newDrive) {
      await this.getFileData(this.laID, newDrive);
      this.myDrive.selectedDrive = newDrive; // 持久化保存
      this.selectedDrive = newDrive;
      this.autoPlay();
    },
    /**
     * 切换当前选择的集数, 会优先选择浏览器支持的视频
     * @param {String} newEpisode
     * @returns {Promise<String | undefined>}
     */
    changeEpisode(newEpisode) {
      return new Promise((resolve, reject) => {
        if (!this.episodeListFind(newEpisode)) return reject("episodeNotFound");
        this.fileData.activeEpisode = newEpisode;
        // 查找当前集数下合适的视频资源
        const findResult = (findBetter = true) => {
          return this.fileData.fileList.findIndex((file) => {
            return (
              file?.parseResult?.episode == newEpisode &&
              file?.parseResult?.extensionName?.type == "video" &&
              (findBetter ? file?.parseResult.noBrowser === false : true) // 优先找浏览器兼容
            );
          });
        };
        // 更改文件
        this.fileData.activeFileIndex =
          findResult() != -1 ? findResult() : findResult(false);

        // 当播放器可播放且当前活跃视频集数仍是本次切换的视频集数时
        this.artInstance.once("video:canplaythrough", () => {
          if (this.fileData.activeEpisode == newEpisode) {
            resolve();
          } else {
            reject("视频集数切换被其他事件中断");
          }
        });
        // 加载当前集数视频发生错误
        this.artInstance.once("error", (error) => {
          if (this.fileData.activeEpisode == newEpisode) {
            reject(error);
          }
        });
      });
    },
    /**
     * 通过视频 URL 更改活跃视频
     * @param {String} newVideoUrl
     * @param {Boolean} noEp 切换视频时不操作活跃集数. 用于播放非正片视频
     * @returns {Promise<String | Error | undefined>}
     */
    changeVideo(newVideoUrl, noEp = false) {
      return new Promise((resolve, reject) => {
        // 更改活跃文件的索引
        this.fileData.activeFileIndex = this.fileData.fileList.findIndex(
          (file) => {
            return file?.url == newVideoUrl;
          }
        );
        // 更改活跃集数
        if (this.activeFile?.parseResult?.episode && !noEp) {
          this.fileData.activeEpisode = this.activeFile?.parseResult?.episode;
        }

        // 当播放器可播放且当前活跃视频仍是本次切换的视频时
        this.artInstance.once("video:canplaythrough", () => {
          if (this.activeFile?.url == newVideoUrl) {
            resolve();
          } else {
            reject("视频切换被其他事件中断");
          }
        });
        // 加载当前视频发生错误
        this.artInstance.once("error", (error) => {
          if (this.activeFile?.url == newVideoUrl) {
            reject(error);
          }
        });
      });
    },
    /**
     * 获取当前番剧的播放历史记录
     */
    async getAnimeViewHistory() {
      return await LavaAnimeAPI.post("/v2/anime/history/my", {
        animeID: this.laID,
      });
    },
    /**
     * 上报播放情况
     */
    async reportView(isWebPlayer, watchMethod) {
      let content = {
        animeID: this.laID,
        fileName: this.activeFile?.name,
        currentTime: isWebPlayer ? this.artInstance?.currentTime : null,
        totalTime: isWebPlayer ? this.artInstance?.duration : null,
        watchMethod,
        useDrive: this.activeDrive?.id,
      };
      try {
        await axios.post("/v2/anime/history/report", content, {
          baseURL: config.api.lavaAnime,
          headers: {
            Authorization: getToken(),
          },
          timeout: 3000,
        });
      } catch (error) {
        console.error("播放进度上报失败", content, error);
      }
    },
    /**
     * 自动选择一个合适的集数并播放，仅在每次选择节点后调用 (或首次打开番剧时)
     */
    async autoPlay() {
      try {
        let viewHistory = await this.getAnimeViewHistory();
        // 筛选出 WebPlayer 的播放历史
        viewHistory.data.data = viewHistory.data.data?.filter(
          (record) => record.watchMethod == "WebPlayer"
        );

        if (viewHistory.data.data?.length == 0) {
          return this.firstThisAnime();
        }

        // 最近一次播放的视频
        let lastRecord = viewHistory.data.data[0];
        // 在当前的文件列表找出上次的视频
        let findThisFile = this.fileData.fileList.find((file) => {
          return file?.name == lastRecord.fileName;
        });

        // 选择要播放的相同文件 / 集数
        if (findThisFile) {
          console.log("匹配到和上次播放完全相同的文件", findThisFile);
          try {
            await this.changeVideo(findThisFile?.url);
            this.seekByHistory(lastRecord);
          } catch (error) {
            console.error("切换视频时失败", error);
          }
        } else {
          console.log("找不到文件, 同话数模式...", lastRecord?.episode);
          try {
            await this.changeEpisode(lastRecord?.episode);
            this.seekByHistory(lastRecord);
          } catch (error) {
            console.error("切换集数时失败", error);
            if (error == "episodeNotFound") {
              // 之前的集数已经不再存在
              return this.firstThisAnime();
            }
          }
        }
      } catch (error) {
        console.error(error);
        // 获取播放历史失败 使用默认打开界面的情况
        this.firstThisAnime();
      }
    },
    /**
     * (用于其他 actions 调用) 自动播放第一个集数/视频
     */
    firstThisAnime() {
      // 如果能识别到集数列表, 自动选择第一个集数播放
      if (this.episodeList.length) {
        this.changeEpisode(this.episodeList[0].episode);
      }
      // 没有集数列表, 播放第一个视频
      else if (this.fileData.fileList.length) {
        this.changeVideo(
          // 找文件列表中第一个是视频的文件
          this.fileData.fileList.find((file) => {
            return (
              file?.type == "file" &&
              file?.parseResult?.extensionName.type == "video"
            );
          })?.url
        );
      }
    },
    /**
     * 传入历史记录, 跳转进度条并显示用户提示
     * @param {Object | undefined} history
     */
    async seekByHistory(history) {
      if (history?.currentTime) {
        this.artInstance.video.currentTime = history.currentTime;
        const ep = history?.episode ? `第 ${history.episode} 话` : "";
        const m = Math.floor(history?.currentTime / 60)
          .toString()
          .padStart(2, "0");
        const s = (history?.currentTime % 60).toString().padStart(2, "0");
        $message.info(`上次${ep}播放到 ${m}:${s}, 已自动跳转`, 5000);
      }
    },
  },
});
