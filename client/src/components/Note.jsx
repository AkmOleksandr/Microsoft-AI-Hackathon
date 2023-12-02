const Note = ({ title, url, summary }) => {
    return (
        <div>
          <h3>{title}</h3>
          <img src={url} alt={title} />
          <p>{summary}</p>
        </div>
      );
};

export default Note